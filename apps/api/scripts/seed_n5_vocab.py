"""Seed JLPT N5 vocabulary (~170 core words) into the vocabulary table.

Run from apps/api/:
    python scripts/seed_n5_vocab.py
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

# Allow importing app config from anywhere
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncpg
from app.config import settings

# ── N5 Core Vocabulary ────────────────────────────────────────────────────────
# (kanji, reading, meaning, meaning_alts, part_of_speech, tags, example_jp, example_en)

N5_VOCAB: list[tuple] = [
    # ── Numbers / Time ────────────────────────────────────────
    ("一",     "いち",       "one",          [],               "noun",     ["number"],            "一つください。",         "One, please."),
    ("二",     "に",         "two",          [],               "noun",     ["number"],            "二人います。",           "There are two people."),
    ("三",     "さん",       "three",        [],               "noun",     ["number"],            "三時です。",             "It is three o'clock."),
    ("四",     "し・よん",   "four",         [],               "noun",     ["number"],            "四月です。",             "It is April."),
    ("五",     "ご",         "five",         [],               "noun",     ["number"],            "五百円です。",           "It is 500 yen."),
    ("六",     "ろく",       "six",          [],               "noun",     ["number"],            "六時に起きます。",       "I wake up at six."),
    ("七",     "しち・なな", "seven",        [],               "noun",     ["number"],            "七日です。",             "It is the seventh."),
    ("八",     "はち",       "eight",        [],               "noun",     ["number"],            "八月です。",             "It is August."),
    ("九",     "く・きゅう", "nine",         [],               "noun",     ["number"],            "九時です。",             "It is nine o'clock."),
    ("十",     "じゅう",     "ten",          [],               "noun",     ["number"],            "十分です。",             "Ten minutes."),
    ("百",     "ひゃく",     "hundred",      [],               "noun",     ["number"],            "百円です。",             "It is 100 yen."),
    ("千",     "せん",       "thousand",     [],               "noun",     ["number"],            "千円です。",             "It is 1000 yen."),
    ("万",     "まん",       "ten thousand", [],               "noun",     ["number"],            "一万円です。",           "It is 10,000 yen."),
    ("今",     "いま",       "now",          ["right now"],    "noun",     ["time"],              "今何時ですか？",         "What time is it now?"),
    ("今日",   "きょう",     "today",        [],               "noun",     ["time"],              "今日は晴れです。",       "Today is sunny."),
    ("明日",   "あした",     "tomorrow",     ["あす"],         "noun",     ["time"],              "明日また来ます。",       "I will come again tomorrow."),
    ("昨日",   "きのう",     "yesterday",    [],               "noun",     ["time"],              "昨日学校へ行きました。", "I went to school yesterday."),
    ("今週",   "こんしゅう", "this week",    [],               "noun",     ["time"],              "今週は忙しいです。",     "I am busy this week."),
    ("来週",   "らいしゅう", "next week",    [],               "noun",     ["time"],              "来週また会いましょう。", "Let's meet again next week."),
    ("先週",   "せんしゅう", "last week",    [],               "noun",     ["time"],              "先週どこへ行きましたか？","Where did you go last week?"),
    ("今年",   "ことし",     "this year",    [],               "noun",     ["time"],              "今年は楽しいです。",     "This year is fun."),
    ("来年",   "らいねん",   "next year",    [],               "noun",     ["time"],              "来年日本へ行きます。",   "I will go to Japan next year."),
    ("去年",   "きょねん",   "last year",    [],               "noun",     ["time"],              "去年生まれました。",     "Born last year."),
    ("朝",     "あさ",       "morning",      [],               "noun",     ["time"],              "朝ごはんを食べます。",   "I eat breakfast."),
    ("昼",     "ひる",       "noon / daytime",["midday"],     "noun",     ["time"],              "昼に食べます。",         "I eat at noon."),
    ("晩",     "ばん",       "evening",      ["night"],        "noun",     ["time"],              "晩ごはんを食べます。",   "I eat dinner."),
    ("夜",     "よる",       "night",        [],               "noun",     ["time"],              "夜寝ます。",             "I sleep at night."),
    # ── People ────────────────────────────────────────────────
    ("人",     "ひと",       "person",       ["people"],       "noun",     ["people"],            "あの人は誰ですか？",     "Who is that person?"),
    ("男",     "おとこ",     "man / male",   [],               "noun",     ["people"],            "男の人です。",           "It is a man."),
    ("女",     "おんな",     "woman / female",[],              "noun",     ["people"],            "女の人です。",           "It is a woman."),
    ("子供",   "こども",     "child",        ["children"],     "noun",     ["people", "family"],  "子供が遊んでいます。",   "The children are playing."),
    ("父",     "ちち",       "father",       ["dad (own)"],    "noun",     ["family"],            "父は医者です。",         "My father is a doctor."),
    ("母",     "はは",       "mother",       ["mom (own)"],    "noun",     ["family"],            "母は料理が上手です。",   "My mother is good at cooking."),
    ("兄",     "あに",       "older brother",[],               "noun",     ["family"],            "兄は大学生です。",       "My older brother is a university student."),
    ("姉",     "あね",       "older sister", [],               "noun",     ["family"],            "姉は東京にいます。",     "My older sister is in Tokyo."),
    ("弟",     "おとうと",   "younger brother",[],             "noun",     ["family"],            "弟は小学生です。",       "My younger brother is an elementary student."),
    ("妹",     "いもうと",   "younger sister",[],              "noun",     ["family"],            "妹は可愛いです。",       "My younger sister is cute."),
    ("友達",   "ともだち",   "friend",       ["friends"],      "noun",     ["people"],            "友達と映画を見ます。",   "I watch movies with friends."),
    ("先生",   "せんせい",   "teacher",      [],               "noun",     ["people", "school"],  "先生は優しいです。",     "The teacher is kind."),
    ("学生",   "がくせい",   "student",      [],               "noun",     ["people", "school"],  "私は学生です。",         "I am a student."),
    # ── Places ────────────────────────────────────────────────
    ("学校",   "がっこう",   "school",       [],               "noun",     ["place", "school"],   "学校へ行きます。",       "I go to school."),
    ("家",     "うち・いえ", "house / home", [],               "noun",     ["place"],             "家に帰ります。",         "I return home."),
    ("駅",     "えき",       "station",      ["train station"],"noun",     ["place", "transport"],"駅はどこですか？",       "Where is the station?"),
    ("銀行",   "ぎんこう",   "bank",         [],               "noun",     ["place"],             "銀行へ行きます。",       "I go to the bank."),
    ("病院",   "びょういん", "hospital",     [],               "noun",     ["place"],             "病院に行きます。",       "I go to the hospital."),
    ("図書館", "としょかん", "library",      [],               "noun",     ["place"],             "図書館で勉強します。",   "I study at the library."),
    ("レストラン","れすとらん","restaurant",  [],               "noun",     ["place", "food"],     "レストランで食べます。", "I eat at a restaurant."),
    ("郵便局", "ゆうびんきょく","post office",[],              "noun",     ["place"],             "郵便局へ行きます。",     "I go to the post office."),
    ("公園",   "こうえん",   "park",         [],               "noun",     ["place"],             "公園で遊びます。",       "I play at the park."),
    ("店",     "みせ",       "store / shop", [],               "noun",     ["place"],             "店で買います。",         "I buy at the store."),
    ("部屋",   "へや",       "room",         [],               "noun",     ["place"],             "部屋に入ります。",       "I enter the room."),
    ("国",     "くに",       "country",      ["nation"],       "noun",     ["place"],             "どの国から来ましたか？", "Which country are you from?"),
    ("日本",   "にほん",     "Japan",        [],               "noun",     ["place", "country"],  "日本語を勉強します。",   "I study Japanese."),
    # ── Food & Drink ──────────────────────────────────────────
    ("ご飯",   "ごはん",     "rice / meal",  ["cooked rice"],  "noun",     ["food"],              "ご飯を食べます。",       "I eat rice."),
    ("水",     "みず",       "water",        [],               "noun",     ["food", "drink"],     "水を飲みます。",         "I drink water."),
    ("お茶",   "おちゃ",     "tea",          ["green tea"],    "noun",     ["food", "drink"],     "お茶を飲みます。",       "I drink tea."),
    ("パン",   "ぱん",       "bread",        [],               "noun",     ["food"],              "パンを食べます。",       "I eat bread."),
    ("魚",     "さかな",     "fish",         [],               "noun",     ["food"],              "魚を食べます。",         "I eat fish."),
    ("肉",     "にく",       "meat",         [],               "noun",     ["food"],              "肉が好きです。",         "I like meat."),
    ("野菜",   "やさい",     "vegetables",   [],               "noun",     ["food"],              "野菜を食べます。",       "I eat vegetables."),
    ("果物",   "くだもの",   "fruit",        [],               "noun",     ["food"],              "果物が好きです。",       "I like fruit."),
    ("卵",     "たまご",     "egg",          [],               "noun",     ["food"],              "卵を食べます。",         "I eat eggs."),
    # ── Things ────────────────────────────────────────────────
    ("本",     "ほん",       "book",         [],               "noun",     ["object"],            "本を読みます。",         "I read a book."),
    ("新聞",   "しんぶん",   "newspaper",    [],               "noun",     ["object"],            "新聞を読みます。",       "I read a newspaper."),
    ("時計",   "とけい",     "clock / watch",[],               "noun",     ["object"],            "時計を見ます。",         "I look at the clock."),
    ("鞄",     "かばん",     "bag",          ["handbag"],      "noun",     ["object"],            "鞄を持ちます。",         "I carry a bag."),
    ("財布",   "さいふ",     "wallet",       ["purse"],        "noun",     ["object"],            "財布はどこですか？",     "Where is my wallet?"),
    ("傘",     "かさ",       "umbrella",     [],               "noun",     ["object"],            "傘を持ちます。",         "I bring an umbrella."),
    ("鍵",     "かぎ",       "key",          [],               "noun",     ["object"],            "鍵を忘れました。",       "I forgot the key."),
    ("電話",   "でんわ",     "telephone",    [],               "noun",     ["object"],            "電話をかけます。",       "I make a phone call."),
    ("テレビ", "てれび",     "television",   ["TV"],           "noun",     ["object"],            "テレビを見ます。",       "I watch TV."),
    ("写真",   "しゃしん",   "photograph",   ["photo"],        "noun",     ["object"],            "写真を撮ります。",       "I take a photo."),
    ("手紙",   "てがみ",     "letter",       [],               "noun",     ["object"],            "手紙を書きます。",       "I write a letter."),
    ("お金",   "おかね",     "money",        [],               "noun",     ["object"],            "お金がありますか？",     "Do you have money?"),
    ("車",     "くるま",     "car",          ["automobile"],   "noun",     ["transport", "object"],"車で行きます。",         "I go by car."),
    ("電車",   "でんしゃ",   "train",        [],               "noun",     ["transport"],         "電車に乗ります。",       "I ride the train."),
    ("自転車", "じてんしゃ", "bicycle",      ["bike"],         "noun",     ["transport"],         "自転車で来ます。",       "I come by bicycle."),
    # ── Verbs ─────────────────────────────────────────────────
    ("食べる", "たべる",     "to eat",       [],               "verb_ru",  ["action", "food"],    "ご飯を食べます。",       "I eat rice."),
    ("飲む",   "のむ",       "to drink",     [],               "verb_u",   ["action", "drink"],   "水を飲みます。",         "I drink water."),
    ("見る",   "みる",       "to see / watch",[],              "verb_ru",  ["action"],            "テレビを見ます。",       "I watch TV."),
    ("聞く",   "きく",       "to listen / ask",[],             "verb_u",   ["action"],            "音楽を聞きます。",       "I listen to music."),
    ("話す",   "はなす",     "to speak",     ["to talk"],      "verb_u",   ["action", "language"],"日本語を話します。",     "I speak Japanese."),
    ("読む",   "よむ",       "to read",      [],               "verb_u",   ["action"],            "本を読みます。",         "I read a book."),
    ("書く",   "かく",       "to write",     [],               "verb_u",   ["action"],            "手紙を書きます。",       "I write a letter."),
    ("買う",   "かう",       "to buy",       [],               "verb_u",   ["action"],            "本を買います。",         "I buy a book."),
    ("売る",   "うる",       "to sell",      [],               "verb_u",   ["action"],            "車を売ります。",         "I sell a car."),
    ("来る",   "くる",       "to come",      [],               "verb_irr", ["action", "movement"],"友達が来ます。",         "My friend comes."),
    ("行く",   "いく",       "to go",        [],               "verb_u",   ["action", "movement"],"学校へ行きます。",       "I go to school."),
    ("帰る",   "かえる",     "to return",    ["to go home"],   "verb_u",   ["action", "movement"],"家に帰ります。",         "I return home."),
    ("起きる", "おきる",     "to wake up",   [],               "verb_ru",  ["action", "daily"],   "七時に起きます。",       "I wake up at seven."),
    ("寝る",   "ねる",       "to sleep",     ["to go to bed"], "verb_ru",  ["action", "daily"],   "十時に寝ます。",         "I sleep at ten."),
    ("する",   "する",       "to do",        [],               "verb_irr", ["action"],            "勉強をします。",         "I study."),
    ("ある",   "ある",       "to exist (inanimate)",[],        "verb_u",   ["existence"],         "本があります。",         "There is a book."),
    ("いる",   "いる",       "to exist (animate)",[],          "verb_ru",  ["existence"],         "猫がいます。",           "There is a cat."),
    ("わかる", "わかる",     "to understand",[],               "verb_u",   ["action", "mental"],  "わかりました。",         "I understand."),
    ("知る",   "しる",       "to know",      [],               "verb_u",   ["action", "mental"],  "知りません。",           "I don't know."),
    ("思う",   "おもう",     "to think",     [],               "verb_u",   ["action", "mental"],  "そう思います。",         "I think so."),
    ("会う",   "あう",       "to meet",      [],               "verb_u",   ["action", "social"],  "友達に会います。",       "I meet my friend."),
    ("待つ",   "まつ",       "to wait",      [],               "verb_u",   ["action"],            "ここで待ちます。",       "I wait here."),
    ("立つ",   "たつ",       "to stand",     [],               "verb_u",   ["action", "movement"],"立ってください。",       "Please stand up."),
    ("座る",   "すわる",     "to sit",       [],               "verb_u",   ["action"],            "座ってください。",       "Please sit down."),
    ("入る",   "はいる",     "to enter",     [],               "verb_u",   ["action", "movement"],"部屋に入ります。",       "I enter the room."),
    ("出る",   "でる",       "to exit / leave",[],             "verb_ru",  ["action", "movement"],"家を出ます。",           "I leave home."),
    ("開ける", "あける",     "to open",      [],               "verb_ru",  ["action"],            "ドアを開けます。",       "I open the door."),
    ("閉める", "しめる",     "to close",     [],               "verb_ru",  ["action"],            "窓を閉めます。",         "I close the window."),
    ("貸す",   "かす",       "to lend",      [],               "verb_u",   ["action", "social"],  "本を貸します。",         "I lend a book."),
    ("借りる", "かりる",     "to borrow",    [],               "verb_ru",  ["action", "social"],  "本を借ります。",         "I borrow a book."),
    ("使う",   "つかう",     "to use",       [],               "verb_u",   ["action"],            "パソコンを使います。",   "I use a computer."),
    ("作る",   "つくる",     "to make",      [],               "verb_u",   ["action"],            "料理を作ります。",       "I cook food."),
    ("見せる", "みせる",     "to show",      [],               "verb_ru",  ["action"],            "写真を見せます。",       "I show a photo."),
    ("教える", "おしえる",   "to teach",     [],               "verb_ru",  ["action", "school"],  "日本語を教えます。",     "I teach Japanese."),
    ("勉強する","べんきょうする","to study",  [],               "verb_irr", ["action", "school"],  "毎日勉強します。",       "I study every day."),
    ("働く",   "はたらく",   "to work",      [],               "verb_u",   ["action", "work"],    "会社で働きます。",       "I work at a company."),
    ("休む",   "やすむ",     "to rest",      [],               "verb_u",   ["action", "daily"],   "今日は休みます。",       "I rest today."),
    ("遊ぶ",   "あそぶ",     "to play",      [],               "verb_u",   ["action"],            "公園で遊びます。",       "I play at the park."),
    ("泳ぐ",   "およぐ",     "to swim",      [],               "verb_u",   ["action", "sport"],   "海で泳ぎます。",         "I swim in the sea."),
    ("走る",   "はしる",     "to run",       [],               "verb_u",   ["action", "sport"],   "毎朝走ります。",         "I run every morning."),
    ("歩く",   "あるく",     "to walk",      [],               "verb_u",   ["action", "movement"],"駅まで歩きます。",       "I walk to the station."),
    ("乗る",   "のる",       "to ride / board",[],             "verb_u",   ["action", "transport"],"電車に乗ります。",       "I ride the train."),
    ("降りる", "おりる",     "to get off",   [],               "verb_ru",  ["action", "transport"],"ここで降ります。",       "I get off here."),
    ("撮る",   "とる",       "to take (photo)",[],             "verb_u",   ["action"],            "写真を撮ります。",       "I take a photo."),
    ("持つ",   "もつ",       "to hold / carry",[],             "verb_u",   ["action"],            "荷物を持ちます。",       "I carry luggage."),
    ("着る",   "きる",       "to wear (upper body)",[],        "verb_ru",  ["action", "clothes"],  "シャツを着ます。",      "I wear a shirt."),
    ("脱ぐ",   "ぬぐ",       "to take off (clothes)",[],       "verb_u",   ["action", "clothes"],  "コートを脱ぎます。",    "I take off my coat."),
    ("洗う",   "あらう",     "to wash",      [],               "verb_u",   ["action", "daily"],   "手を洗います。",         "I wash my hands."),
    ("切る",   "きる",       "to cut",       [],               "verb_u",   ["action"],            "紙を切ります。",         "I cut paper."),
    # ── Adjectives (い-adj) ───────────────────────────────────
    ("大きい", "おおきい",   "big / large",  ["large"],        "i_adj",    ["size"],              "大きい犬です。",         "It is a big dog."),
    ("小さい", "ちいさい",   "small / little",["little"],      "i_adj",    ["size"],              "小さい猫です。",         "It is a small cat."),
    ("高い",   "たかい",     "tall / expensive",[],            "i_adj",    ["size", "price"],     "このビルは高いです。",   "This building is tall."),
    ("低い",   "ひくい",     "low / short (height)",[],        "i_adj",    ["size"],              "低い山です。",           "It is a low mountain."),
    ("長い",   "ながい",     "long",         [],               "i_adj",    ["size"],              "長い道です。",           "It is a long road."),
    ("短い",   "みじかい",   "short",        [],               "i_adj",    ["size"],              "短い話です。",           "It is a short story."),
    ("新しい", "あたらしい", "new",          [],               "i_adj",    ["state"],             "新しい車です。",         "It is a new car."),
    ("古い",   "ふるい",     "old",          [],               "i_adj",    ["state"],             "古い建物です。",         "It is an old building."),
    ("良い",   "よい・いい", "good",         [],               "i_adj",    ["quality"],           "良い天気です。",         "The weather is good."),
    ("悪い",   "わるい",     "bad",          [],               "i_adj",    ["quality"],           "気分が悪いです。",       "I feel bad."),
    ("多い",   "おおい",     "many / much",  [],               "i_adj",    ["quantity"],          "人が多いです。",         "There are many people."),
    ("少ない", "すくない",   "few / little", [],               "i_adj",    ["quantity"],          "お金が少ないです。",     "I have little money."),
    ("暑い",   "あつい",     "hot (weather)", [],              "i_adj",    ["weather"],           "今日は暑いです。",       "Today is hot."),
    ("寒い",   "さむい",     "cold (weather)",[],              "i_adj",    ["weather"],           "今日は寒いです。",       "Today is cold."),
    ("熱い",   "あつい",     "hot (to touch)",[],              "i_adj",    ["temperature"],       "熱いコーヒーです。",     "It is hot coffee."),
    ("冷たい", "つめたい",   "cold (to touch)",[],             "i_adj",    ["temperature"],       "冷たい水です。",         "It is cold water."),
    ("美味しい","おいしい",  "delicious",    ["tasty"],        "i_adj",    ["taste"],             "このご飯は美味しいです。","This food is delicious."),
    ("まずい", "まずい",     "bad tasting",  [],               "i_adj",    ["taste"],             "まずい料理です。",       "It is bad-tasting food."),
    ("楽しい", "たのしい",   "fun / enjoyable",[],             "i_adj",    ["feeling"],           "楽しいパーティーです。", "It is a fun party."),
    ("難しい", "むずかしい", "difficult",    ["hard"],         "i_adj",    ["difficulty"],        "難しい問題です。",       "It is a difficult problem."),
    ("易しい", "やさしい",   "easy / gentle",[],               "i_adj",    ["difficulty"],        "易しい問題です。",       "It is an easy problem."),
    ("忙しい", "いそがしい", "busy",         [],               "i_adj",    ["state"],             "今日は忙しいです。",     "I am busy today."),
    ("欲しい", "ほしい",     "wanted / desired",[],            "i_adj",    ["feeling"],           "新しい車が欲しいです。", "I want a new car."),
    ("白い",   "しろい",     "white",        [],               "i_adj",    ["color"],             "白い雪です。",           "It is white snow."),
    ("黒い",   "くろい",     "black",        [],               "i_adj",    ["color"],             "黒い猫です。",           "It is a black cat."),
    ("赤い",   "あかい",     "red",          [],               "i_adj",    ["color"],             "赤いバラです。",         "It is a red rose."),
    ("青い",   "あおい",     "blue",         [],               "i_adj",    ["color"],             "青い空です。",           "It is a blue sky."),
    ("黄色い", "きいろい",   "yellow",       [],               "i_adj",    ["color"],             "黄色い花です。",         "It is a yellow flower."),
    # ── Adjectives (な-adj) ───────────────────────────────────
    ("好き",   "すき",       "liked / favorite",[],            "na_adj",   ["feeling"],           "音楽が好きです。",       "I like music."),
    ("嫌い",   "きらい",     "disliked",     [],               "na_adj",   ["feeling"],           "魚が嫌いです。",         "I dislike fish."),
    ("元気",   "げんき",     "healthy / energetic",[],         "na_adj",   ["health"],            "元気ですか？",           "Are you well?"),
    ("静か",   "しずか",     "quiet",        [],               "na_adj",   ["state"],             "静かな部屋です。",       "It is a quiet room."),
    ("賑やか", "にぎやか",   "lively / bustling",[],           "na_adj",   ["state"],             "賑やかな街です。",       "It is a lively town."),
    ("綺麗",   "きれい",     "beautiful / clean",[],           "na_adj",   ["quality"],           "綺麗な花です。",         "It is a beautiful flower."),
    ("有名",   "ゆうめい",   "famous",       [],               "na_adj",   ["quality"],           "有名な歌手です。",       "It is a famous singer."),
    ("大切",   "たいせつ",   "important",    ["precious"],     "na_adj",   ["quality"],           "大切な友達です。",       "A precious friend."),
    ("便利",   "べんり",     "convenient",   [],               "na_adj",   ["quality"],           "便利な道具です。",       "It is a convenient tool."),
    ("上手",   "じょうず",   "skilled / good at",[],           "na_adj",   ["ability"],           "料理が上手です。",       "Good at cooking."),
    ("下手",   "へた",       "unskilled / bad at",[],          "na_adj",   ["ability"],           "歌が下手です。",         "Bad at singing."),
    ("親切",   "しんせつ",   "kind / helpful",[],              "na_adj",   ["quality"],           "親切な人です。",         "It is a kind person."),
    ("暇",     "ひま",       "free time / idle",[],            "na_adj",   ["time", "state"],     "暇があります。",         "I have free time."),
    ("大変",   "たいへん",   "hard / awful / very",[],         "na_adj",   ["intensity"],         "大変な仕事です。",       "It is tough work."),
    # ── Adverbs / expressions ─────────────────────────────────
    ("とても", "とても",     "very",         ["really"],       "adverb",   ["degree"],            "とても美味しいです。",   "It is very delicious."),
    ("少し",   "すこし",     "a little",     ["a bit"],        "adverb",   ["quantity"],          "少し待ってください。",   "Please wait a little."),
    ("もう",   "もう",       "already / anymore",[],           "adverb",   ["time"],              "もう帰ります。",         "I'm already leaving."),
    ("まだ",   "まだ",       "still / not yet",[],             "adverb",   ["time"],              "まだ食べています。",     "I am still eating."),
    ("また",   "また",       "again",        [],               "adverb",   ["time"],              "また来ます。",           "I will come again."),
    ("一緒に", "いっしょに", "together",     [],               "adverb",   ["manner"],            "一緒に行きましょう。",   "Let's go together."),
    ("ゆっくり","ゆっくり",  "slowly",       [],               "adverb",   ["manner"],            "ゆっくり話してください。","Please speak slowly."),
    ("はっきり","はっきり",  "clearly",      [],               "adverb",   ["manner"],            "はっきり言ってください。","Please say it clearly."),
    ("全部",   "ぜんぶ",     "all / everything",[],            "adverb",   ["quantity"],          "全部食べました。",       "I ate everything."),
    ("だいたい","だいたい",  "approximately",[],               "adverb",   ["degree"],            "だいたい一時間です。",   "It is about one hour."),
    # ── Weather ───────────────────────────────────────────────
    ("天気",   "てんき",     "weather",      [],               "noun",     ["weather"],           "天気はどうですか？",     "How is the weather?"),
    ("晴れ",   "はれ",       "sunny / clear",[],               "noun",     ["weather"],           "今日は晴れです。",       "Today is sunny."),
    ("雨",     "あめ",       "rain",         [],               "noun",     ["weather"],           "雨が降ります。",         "It rains."),
    ("雪",     "ゆき",       "snow",         [],               "noun",     ["weather"],           "雪が降ります。",         "It snows."),
    ("風",     "かぜ",       "wind",         [],               "noun",     ["weather"],           "風が強いです。",         "The wind is strong."),
    ("曇り",   "くもり",     "cloudy",       [],               "noun",     ["weather"],           "今日は曇りです。",       "Today is cloudy."),
    # ── Body ──────────────────────────────────────────────────
    ("頭",     "あたま",     "head",         [],               "noun",     ["body"],              "頭が痛いです。",         "I have a headache."),
    ("目",     "め",         "eye",          ["eyes"],         "noun",     ["body"],              "目が大きいです。",       "The eyes are big."),
    ("耳",     "みみ",       "ear",          ["ears"],         "noun",     ["body"],              "耳が痛いです。",         "My ear hurts."),
    ("口",     "くち",       "mouth",        [],               "noun",     ["body"],              "口を開けてください。",   "Please open your mouth."),
    ("手",     "て",         "hand",         [],               "noun",     ["body"],              "手を洗います。",         "I wash my hands."),
    ("足",     "あし",       "foot / leg",   [],               "noun",     ["body"],              "足が痛いです。",         "My leg hurts."),
    ("体",     "からだ",     "body",         [],               "noun",     ["body"],              "体を動かします。",       "I move my body."),
    # ── Nature & Animals ──────────────────────────────────────
    ("山",     "やま",       "mountain",     [],               "noun",     ["nature"],            "山に登ります。",         "I climb the mountain."),
    ("川",     "かわ",       "river",        [],               "noun",     ["nature"],            "川で泳ぎます。",         "I swim in the river."),
    ("海",     "うみ",       "sea / ocean",  [],               "noun",     ["nature"],            "海に行きます。",         "I go to the sea."),
    ("花",     "はな",       "flower",       [],               "noun",     ["nature"],            "花が綺麗です。",         "The flowers are beautiful."),
    ("木",     "き",         "tree",         [],               "noun",     ["nature"],            "大きい木です。",         "It is a big tree."),
    ("犬",     "いぬ",       "dog",          [],               "noun",     ["animal"],            "犬が好きです。",         "I like dogs."),
    ("猫",     "ねこ",       "cat",          [],               "noun",     ["animal"],            "猫がいます。",           "There is a cat."),
    # ── Particles & Grammar words ─────────────────────────────
    ("何",     "なに・なん", "what",         [],               "expression",["question"],          "これは何ですか？",       "What is this?"),
    ("誰",     "だれ",       "who",          [],               "expression",["question"],          "あの人は誰ですか？",     "Who is that person?"),
    ("どこ",   "どこ",       "where",        [],               "expression",["question"],          "どこへ行きますか？",     "Where are you going?"),
    ("いつ",   "いつ",       "when",         [],               "expression",["question"],          "いつ来ますか？",         "When are you coming?"),
    ("どうして","どうして",  "why",          [],               "expression",["question"],          "どうして泣いていますか？","Why are you crying?"),
    ("どう",   "どう",       "how",          [],               "expression",["question"],          "どうですか？",           "How is it?"),
    ("これ",   "これ",       "this (close)",  [],              "expression",["demonstrative"],     "これは本です。",         "This is a book."),
    ("それ",   "それ",       "that (middle)", [],              "expression",["demonstrative"],     "それは何ですか？",       "What is that?"),
    ("あれ",   "あれ",       "that (far)",    [],              "expression",["demonstrative"],     "あれは何ですか？",       "What is that (over there)?"),
    ("ここ",   "ここ",       "here",          [],              "expression",["location"],          "ここに来てください。",   "Please come here."),
    ("そこ",   "そこ",       "there",         [],              "expression",["location"],          "そこに座ってください。", "Please sit there."),
    ("あそこ", "あそこ",     "over there",    [],              "expression",["location"],          "あそこはどこですか？",   "Where is over there?"),
    ("はい",   "はい",       "yes",           [],              "expression",["response"],          "はい、そうです。",       "Yes, that's right."),
    ("いいえ", "いいえ",     "no",            [],              "expression",["response"],          "いいえ、違います。",     "No, that's wrong."),
    ("ありがとう","ありがとう","thank you",   [],              "expression",["social"],            "ありがとうございます。", "Thank you very much."),
    ("すみません","すみません","excuse me / sorry",[],         "expression",["social"],            "すみません、助けてください。","Excuse me, please help me."),
    ("ください","ください",  "please give me / please",[],    "expression",["request"],           "水をください。",         "Please give me water."),
    ("でも",   "でも",       "but / however", [],              "conjunction",["grammar"],          "でも、難しいです。",     "But it is difficult."),
    ("そして", "そして",     "and then / and",[],              "conjunction",["grammar"],          "食べて、そして寝ます。", "I eat, and then sleep."),
    ("だから", "だから",     "therefore / so",[],              "conjunction",["grammar"],          "だから行きません。",     "Therefore I won't go."),
]


async def seed():
    dsn = settings.database_url
    conn = await asyncpg.connect(dsn=dsn)

    # Check existing count
    existing = await conn.fetchval("SELECT COUNT(*) FROM vocabulary WHERE jlpt_level = 5")
    if existing and existing > 0:
        print(f"Vocabulary already seeded ({existing} rows). Skipping.")
        await conn.close()
        return

    print(f"Seeding {len(N5_VOCAB)} N5 vocabulary words...")

    async with conn.transaction():
        for i, row in enumerate(N5_VOCAB):
            kanji, reading, meaning, alts, pos, tags, example_jp, example_en = row
            await conn.execute(
                """
                INSERT INTO vocabulary
                    (kanji, reading, meaning, meaning_alts, part_of_speech,
                     jlpt_level, tags, example_jp, example_en, sort_order)
                VALUES ($1,$2,$3,$4,$5,5,$6,$7,$8,$9)
                ON CONFLICT DO NOTHING
                """,
                kanji, reading, meaning, alts, pos,
                tags, example_jp, example_en, i,
            )

    final = await conn.fetchval("SELECT COUNT(*) FROM vocabulary WHERE jlpt_level = 5")
    print(f"Done. {final} N5 words in database.")

    # Seed one starter lesson that references the first 20 vocab
    first_ids = await conn.fetch(
        "SELECT id FROM vocabulary WHERE jlpt_level=5 ORDER BY sort_order LIMIT 20"
    )
    vocab_ids = [str(r["id"]) for r in first_ids]

    await conn.execute(
        """
        INSERT INTO lessons (title, title_ja, type, description, sort_order, is_free, vocab_ids, content_json)
        VALUES ($1,$2,$3,$4,1,true,$5::uuid[],$6::jsonb)
        ON CONFLICT DO NOTHING
        """,
        "Numbers & Time", "数字と時間", "vocabulary",
        "Master essential N5 numbers, time words, and date expressions.",
        vocab_ids,
        '{"sections": [{"type": "intro", "text": "Learn core N5 number and time vocabulary."}]}',
    )

    await conn.execute(
        """
        INSERT INTO lessons (title, title_ja, type, description, sort_order, is_free, vocab_ids, content_json)
        VALUES ($1,$2,$3,$4,2,true,$5::uuid[],$6::jsonb)
        ON CONFLICT DO NOTHING
        """,
        "People & Family", "人と家族", "vocabulary",
        "Learn vocabulary for people, family members, and common social roles.",
        (await conn.fetch(
            "SELECT id FROM vocabulary WHERE jlpt_level=5 AND 'people'=ANY(tags) OR 'family'=ANY(tags) ORDER BY sort_order LIMIT 20"
        ) and [str(r["id"]) for r in await conn.fetch(
            "SELECT id FROM vocabulary WHERE jlpt_level=5 AND ('people'=ANY(tags) OR 'family'=ANY(tags)) ORDER BY sort_order LIMIT 20"
        )]),
        '{"sections": [{"type": "intro", "text": "Learn vocabulary about people and family."}]}',
    )

    print("Starter lessons seeded.")
    await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
