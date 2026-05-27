"""JWT helpers, bcrypt, TOTP utilities, and disposable email denylist."""

from __future__ import annotations

import base64
import io
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import pyotp
import qrcode
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

logger = logging.getLogger(__name__)

# ── Password hashing ──────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── Password strength validation ──────────────────────────────
import re

PASSWORD_MIN_LENGTH = 10
_PASSWORD_RE = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]).{10,}$"
)


def validate_password_strength(password: str) -> tuple[bool, str]:
    """Returns (is_valid, error_message)."""
    if len(password) < PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {PASSWORD_MIN_LENGTH} characters."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit."
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password):
        return False, "Password must contain at least one special character."
    return True, ""


# ── Disposable email denylist ─────────────────────────────────
# Built-in list of common disposable email domains
_BUILTIN_DISPOSABLE_DOMAINS: frozenset[str] = frozenset(
    [
        "mailinator.com",
        "guerrillamail.com",
        "guerrillamail.net",
        "guerrillamail.org",
        "guerrillamail.biz",
        "guerrillamail.de",
        "guerrillamail.info",
        "sharklasers.com",
        "guerrillamailblock.com",
        "grr.la",
        "spam4.me",
        "trashmail.com",
        "trashmail.me",
        "trashmail.net",
        "throwam.com",
        "throwaway.email",
        "yopmail.com",
        "yopmail.fr",
        "cool.fr.nf",
        "jetable.fr.nf",
        "nospam.ze.tc",
        "nomail.xl.cx",
        "mega.zik.dj",
        "speed.1s.fr",
        "courriel.fr.nf",
        "moncourrier.fr.nf",
        "monemail.fr.nf",
        "monmail.fr.nf",
        "tempmail.com",
        "temp-mail.org",
        "fakeinbox.com",
        "mailnull.com",
        "spamgourmet.com",
        "dispostable.com",
        "maildrop.cc",
        "spamherelots.com",
        "mailnesia.com",
        "throwam.com",
        "getnada.com",
        "zetmail.com",
        "binkmail.com",
        "bobmail.info",
        "chammy.info",
        "devnullmail.com",
        "divermail.com",
        "dump-email.info",
        "emailias.com",
        "emailinfive.com",
        "emailtemporanea.net",
        "filzmail.com",
        "flyspam.com",
        "freemail.ms",
        "getonemail.com",
        "haltospam.com",
        "ispungebob.com",
        "jetable.net",
        "kasmail.com",
        "klzlk.com",
        "lovemeleaveme.com",
        "maileater.com",
        "mailexpire.com",
        "mailfreeonline.com",
        "mailguard.me",
        "mailin8r.com",
        "mailme.lv",
        "mailmetrash.com",
        "mailmoat.com",
        "mailnew.com",
        "mailscrap.com",
        "mailsiphon.com",
        "mailslite.com",
        "mailzilla.com",
        "mbx.cc",
        "mega.zik.dj",
        "meltmail.com",
        "mintemail.com",
        "moncourrier.fr.nf",
        "mt2009.com",
        "mt2014.com",
        "mustbedone.com",
        "netzidiot.de",
        "neverbox.com",
        "no-spam.ws",
        "noblepioneer.com",
        "nomail.pw",
        "nomail2me.com",
        "nospamfor.us",
        "nospamthanks.info",
        "notmailinator.com",
        "nowmymail.com",
        "objectmail.com",
        "obobbo.com",
        "odnorazovoe.ru",
        "oneoffmail.com",
        "onewaymail.com",
        "online.ms",
        "opayq.com",
        "ordinaryamerican.net",
        "otherinbox.com",
        "ourklips.com",
        "outlawspam.com",
        "owlpic.com",
        "pjjkp.com",
        "plexolan.de",
        "poofy.org",
        "pookmail.com",
        "privacy.net",
        "proxymail.eu",
        "prtnx.com",
        "quickinbox.com",
        "rcpt.at",
        "reallymymail.com",
        "recode.me",
        "recursor.net",
        "regbypass.com",
        "regbypass.comsafe-mail.net",
        "rhyta.com",
        "rmqkr.net",
        "royal.net",
        "rppkn.com",
        "rtrtr.com",
        "s0ny.net",
        "safe-mail.net",
        "safetymail.info",
        "safetypost.de",
        "saynotospams.com",
        "selfdestructingmail.com",
        "sendspamhere.com",
        "sharklasers.com",
        "shieldemail.com",
        "shiftmail.com",
        "shitmail.me",
        "shitware.nl",
        "skeefmail.com",
        "slapsfromlastnight.com",
        "slaskpost.se",
        "smashmail.de",
        "smellfear.com",
        "snkmail.com",
        "sofortmail.de",
        "sogetthis.com",
        "soodonims.com",
        "spam.la",
        "spam.mn",
        "spam.su",
        "spambin.com",
        "spambox.info",
        "spambox.irishspringrealty.com",
        "spambox.us",
        "spamcannon.com",
        "spamcannon.net",
        "spamcero.com",
        "spamcon.org",
        "spamcorptastic.com",
        "spamcowboy.com",
        "spamcowboy.net",
        "spamcowboy.org",
        "spamday.com",
        "spamex.com",
        "spamfree24.de",
        "spamfree24.eu",
        "spamfree24.info",
        "spamfree24.net",
        "spamfree24.org",
        "spamgourmet.com",
        "spamgourmet.net",
        "spamgourmet.org",
        "spamhole.com",
        "spamify.com",
        "spaminator.de",
        "spamkill.info",
        "spaml.com",
        "spaml.de",
        "spammotel.com",
        "spammy.host",
        "spamoff.de",
        "spamslicer.com",
        "spamspot.com",
        "spamthis.co.uk",
        "spamthisplease.com",
        "spamtrail.com",
        "spamtroll.net",
        "speed.1s.fr",
        "spikio.com",
        "spoofmail.de",
        "stuffmail.de",
        "super-auswahl.de",
        "supergreatmail.com",
        "supermailer.jp",
        "superrito.com",
        "superstachel.de",
        "suremail.info",
        "svk.jp",
        "sweetxxx.de",
        "tafmail.com",
        "tagyourself.com",
        "talkinator.com",
        "tapchief.com",
        "teewars.org",
        "teleworm.com",
        "teleworm.us",
        "temp-mail.de",
        "temp-mail.ru",
        "tempalias.com",
        "tempe-mail.com",
        "tempemail.biz",
        "tempemail.com",
        "tempemail.net",
        "tempinbox.co.uk",
        "tempinbox.com",
        "tempmail.eu",
        "tempmail.it",
        "tempmail2.com",
        "tempr.email",
        "tempsky.com",
        "tempthe.net",
        "tempymail.com",
        "thanksnospam.info",
        "thisisnotmyrealemail.com",
        "throam.com",
        "throwam.com",
        "throwawaymail.com",
        "tilien.com",
        "tittbit.in",
        "tizi.com",
        "tmailinator.com",
        "toiea.com",
        "tonytemplates.com",
        "trash-amil.com",
        "trash-mail.at",
        "trash-mail.cf",
        "trash-mail.ga",
        "trash-mail.gq",
        "trash-mail.io",
        "trash-mail.ml",
        "trash-mail.tk",
        "trash2009.com",
        "trash2010.com",
        "trash2011.com",
        "trashdevil.com",
        "trashdevil.de",
        "trashemail.de",
        "trashimail.de",
        "trashmail.at",
        "trashmail.com",
        "trashmail.io",
        "trashmail.me",
        "trashmail.net",
        "trashmail.org",
        "trashmailer.com",
        "trashymail.com",
        "trillianpro.com",
        "trnwln.com",
        "trshmail.com",
        "turual.com",
        "twinmail.de",
        "tyldd.com",
        "uggsrock.com",
        "umail.net",
        "unlimit.com",
        "unmail.ru",
        "uroid.com",
        "us.af",
        "venompen.com",
        "veryrealemail.com",
        "viditag.com",
        "viewcastmedia.com",
        "viewcastmedia.net",
        "viewcastmedia.org",
        "walkmail.net",
        "walkmail.ru",
        "webemail.me",
        "weg-werf-email.de",
        "wetrainbayarea.com",
        "wetrainbayarea.org",
        "wilemail.com",
        "willhackforfood.biz",
        "willselfdestruct.com",
        "wispforwarded.com",
        "wronghead.com",
        "wuzupmail.net",
        "www.e4ward.com",
        "www.mailinator.com",
        "wwwnew.eu",
        "xagloo.com",
        "xemaps.com",
        "xents.com",
        "xmaily.com",
        "xoxy.net",
        "xyzfree.net",
        "yapped.net",
        "yeah.net",
        "yep.it",
        "yogamaven.com",
        "yopmail.com",
        "yopmail.fr",
        "yourdomain.com",
        "yuurok.com",
        "z1p.biz",
        "za.com",
        "zehnminuten.de",
        "zehnminutenmail.de",
        "zetmail.com",
        "zippymail.info",
        "zoaxe.com",
        "zoemail.com",
        "zoemail.net",
        "zoemail.org",
        "zomg.info",
    ]
)

_denylist_cache: frozenset[str] | None = None


def _load_denylist() -> frozenset[str]:
    global _denylist_cache
    if _denylist_cache is not None:
        return _denylist_cache

    denylist = set(_BUILTIN_DISPOSABLE_DOMAINS)

    # Load from file if DENYLIST_PATH is set
    denylist_path = settings.denylist_path
    if denylist_path and os.path.isfile(denylist_path):
        try:
            with open(denylist_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip().lower()
                    if line and not line.startswith("#"):
                        denylist.add(line)
        except OSError as e:
            logger.warning("Could not load denylist from %s: %s", denylist_path, e)

    _denylist_cache = frozenset(denylist)
    return _denylist_cache


def is_disposable_email(email: str) -> bool:
    """Returns True if the email domain is in the disposable denylist."""
    domain = email.lower().split("@")[-1] if "@" in email else ""
    return domain in _load_denylist()


# ── JWT helpers ───────────────────────────────────────────────

def create_access_token(
    *,
    user_id: str,
    email: str,
    role: str,
    permissions: list[str],
    extra: dict[str, Any] | None = None,
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload: dict[str, Any] = {
        "sub": user_id,
        "email": email,
        "role": role,
        "permissions": permissions,
        "iat": now,
        "exp": expire,
        "type": "access",
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token. Raises JWTError on failure."""
    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
        options={"verify_exp": True},
    )


def create_refresh_token() -> str:
    """Generate a cryptographically secure opaque refresh token."""
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    """Hash a token for storage (bcrypt-based via passlib)."""
    # Use SHA-256 for refresh/reset token hashing (fast, not bcrypt)
    import hashlib
    return hashlib.sha256(token.encode()).hexdigest()


# ── TOTP helpers ──────────────────────────────────────────────

def generate_totp_secret() -> str:
    """Generate a new TOTP secret."""
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str) -> str:
    """Get the OTP Auth URI for QR code generation."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name="ManaboGo")


def verify_totp_code(secret: str, code: str) -> bool:
    """Verify a TOTP code (allows ±1 window for clock drift)."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


def generate_qr_code_base64(uri: str) -> str:
    """Generate a base64-encoded PNG QR code from an OTP URI."""
    img = qrcode.make(uri)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def generate_backup_codes(count: int = 10) -> list[str]:
    """Generate backup codes (8 hex chars each)."""
    return [secrets.token_hex(4).upper() for _ in range(count)]
