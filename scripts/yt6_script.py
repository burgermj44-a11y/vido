"""YouTube video 6 (English, Pomodoro technique): one beat per sentence.
Each beat = caption index range (from the OCR of his burned-in captions, mapped
onto the silence-cut voice), clean English text, Arabic translation for the
paper strip, Bomi's pose and the stage visual.
Run: python3 scripts/yt6_script.py <capcut.json>  -> src/yt6/script.ts"""
import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TOMATO = "1f345"
TIMER = "23f2"
ALARM = "23f0"
PHONE = "1f4f1"
BRAIN = "1f9e0"
BOOK = "1f4d6"
BOOKS = "1f4da"
FIRE = "1f525"
CHECK = "2705"
CROSS = "274c"
TARGET = "1f3af"
MEMO = "1f4dd"
ROCKET = "1f680"
TROPHY = "1f3c6"
CHART = "1f4c8"
SCREAM = "1f631"
THINK = "1f914"
BULB = "1f4a1"
MUSCLE = "1f4aa"
ZZZ = "1f634"
BELL = "1f514"
WATER = "1f4a7"
WINDOW = "1fa9f"
MOUNTAIN = "1f3d4"
SAD = "1f614"
SWEAT = "1f630"
MSG = "1f4ac"
TV = "1f4fa"
ITALY = "1f1ee-1f1f9"
GRAD = "1f393"
STUDENT = "1f9d1-200d-1f393"
PEN = "270d"
CAL = "1f4c5"
MOON = "1f319"
SUN = "2600"
SUNRISE = "1f305"
TEACH = "1f9d1-200d-1f3eb"
SPEAK = "1f5e3"
SEARCH = "1f50d"
BATT_LOW = "1faab"
BATT = "1f50b"
STAR = "2b50"
PARTY = "1f389"
HUNDRED = "1f4af"
EYES = "1f440"
PUZZLE = "1f9e9"
BRICK = "1f9f1"
PLANE = "2708"
DRAWER = "1f5c4"
MOM = "1f469"
MUTE = "1f515"
WALK = "1f6b6"
PRAY = "1f932"
FAMILY = "1f46a"
FOOD = "1f37d"
RELAX = "1f60c"
STRETCH = "1f9d8"
REPEAT = "1f501"
CLOCK = "1f550"
TURTLE = "1f422"
RABBIT = "1f407"
SEED = "1f331"
GEM = "1f48e"
KEY = "1f5dd"
MEDAL = "1f947"
MATH = "1f9ee"
RULER = "1f4d0"
ZAP = "26a1"
HISTORY = "1f3db"
STOP = "1f6d1"
SHIELD = "1f6e1"
HOURGLASS = "231b"
MONEYBAG = "1f4b0"
HEART = "2764"
SHARE = "1f4e4"
FRIENDS = "1f465"
LADDER = "1fa9c"
FLAG = "1f3c1"
EXPLODE = "1f4a5"
WORLD = "1f30d"
LAZY = "1f9a5"
COMPUTER = "1f4bb"
TIRED = "1f629"
NOTEPAD = "1f5d2"
MASK = "1f92f"
HAPPY = "1f60a"
SPARK = "2728"

S = []  # sections: (cap index, title, palette)
B = []  # beats


def sec(i, title, pal):
    S.append((i, title, pal))


def b(i0, i1, en, ar, kind, pose="idle", **kw):
    B.append(dict(i0=i0, i1=i1, en=en, ar=ar, kind=kind, pose=pose, **kw))


# ---------------- intro ----------------
sec(0, "The Problem", "gold")
b(0, 1, "Have you ever sat down to study, opened your book, looked at the first page,", "هل جلست يومًا لتدرس، وفتحت كتابك، ونظرت إلى الصفحة الأولى،", "emoji", "wave", emoji=[STUDENT, BOOK], labels=["You", "Page 1"], keys=["study"])
b(2, 3, "and then somehow, two hours later, you're still on that same page?", "ثم بطريقة ما، بعد ساعتين، ما زلت في نفس الصفحة؟", "number", "surprised", value=2, unit="h", labels=["...still on page 1"], emoji=[HOURGLASS, SCREAM], keys=["same"])
b(4, 5, "Your phone is in your hand, you've watched twenty videos, replied to five messages", "هاتفك في يدك، شاهدت عشرين فيديو، ورددت على خمس رسائل", "emoji", "think", emoji=[PHONE, TV, MSG], labels=["Phone", "20 videos", "5 messages"], keys=["phone"])
b(6, 6, "and you feel guilty because you know you wasted the whole afternoon.", "وتشعر بالذنب لأنك تعرف أنك أضعت المساء كله.", "emoji", "idle", emoji=[SAD, HOURGLASS], labels=["Guilty", "Wasted afternoon"], keys=["guilty", "wasted"])
b(7, 7, "If that sounds like you, don't worry.", "إذا كان هذا يشبهك، فلا تقلق.", "title", "happy", big="Don't worry!", keys=["worry"], emoji=[HAPPY, HEART])
b(8, 8, "You're not lazy, and you're not stupid.", "أنت لست كسولًا، ولست غبيًا.", "vs", "point", labels=["Lazy?", "Stupid?"], emoji=[LAZY, MASK], keys=["lazy", "stupid"])
b(9, 9, "You just don't have a system yet.", "فقط ليس لديك نظام بعد.", "title", "think", big="You need a SYSTEM", keys=["SYSTEM"], emoji=[PUZZLE, KEY])
b(10, 12, "And today I'm going to give you one of the simplest and most powerful study systems in the world.", "واليوم سأعطيك واحدًا من أبسط وأقوى أنظمة الدراسة في العالم.", "emoji", "happy", emoji=[GEM, WORLD, ROCKET], labels=["Simple", "Powerful", "Proven"], keys=["simplest", "powerful"])
b(13, 13, "It's called the Pomodoro Technique, and if you really apply it,", "اسمها تقنية بومودورو، وإذا طبّقتها حقًا،", "title", "point", big="The Pomodoro Technique", keys=["Pomodoro"], emoji=[TOMATO, TIMER], sfx="mj_hit")
b(14, 14, "I promise you it will change the way you study forever.", "أعدك أنها ستغيّر طريقة دراستك إلى الأبد.", "quote", "happy", big="It will change the way you study forever", keys=["forever", "change"])

# ---------------- focus ----------------
sec(15, "Why You Can't Focus", "night")
b(15, 15, "Before we start, I want you to understand something important.", "قبل أن نبدأ، أريدك أن تفهم شيئًا مهمًا.", "emoji", "point", emoji=[BULB], labels=["Important!"], keys=["important"])
b(16, 17, "The problem for most students is not intelligence. The problem is focus.", "مشكلة أغلب الطلاب ليست الذكاء. المشكلة هي التركيز.", "vs", "think", labels=["Intelligence", "FOCUS"], emoji=[BRAIN, TARGET], keys=["intelligence", "focus"])
b(18, 18, "Our brains today are under attack.", "أدمغتنا اليوم تتعرض للهجوم.", "title", "surprised", big="Your brain is under ATTACK", keys=["ATTACK"], emoji=[BRAIN, EXPLODE], sfx="boom")
b(19, 20, "Every notification, every message, every short video is designed to steal your attention.", "كل إشعار، كل رسالة، كل فيديو قصير مصمَّم ليسرق انتباهك.", "emoji", "surprised", emoji=[BELL, MSG, TV], labels=["Notifications", "Messages", "Short videos"], keys=["steal", "attention"])
b(21, 22, "So when you sit down to study, your brain is fighting against a whole industry that wants your time.", "فعندما تجلس لتدرس، دماغك يحارب صناعة كاملة تريد وقتك.", "vs", "think", labels=["Your brain", "A whole industry"], emoji=[BRAIN, COMPUTER], keys=["fighting", "industry"])
b(23, 24, "And if you just sit there and say to yourself, I'm going to study for four hours, your brain gets scared.", "وإذا جلست وقلت لنفسك: سأدرس أربع ساعات، فإن دماغك يخاف.", "number", "surprised", value=4, unit="h", labels=["Your brain gets scared"], emoji=[SCREAM, SWEAT], keys=["scared"])
b(25, 25, "Four hours feels like a mountain.", "أربع ساعات تبدو كأنها جبل.", "emoji", "think", emoji=[MOUNTAIN], labels=["4 hours = a mountain"], keys=["mountain"])
b(26, 26, "So it looks for any excuse to escape.", "فيبحث عن أي عذر للهروب.", "emoji", "idle", emoji=[RABBIT, PHONE], labels=["Escape!", "Any excuse"], keys=["escape"])
b(27, 27, "That's exactly the problem the Pomodoro Technique solves.", "وهذه بالضبط المشكلة التي تحلّها تقنية بومودورو.", "title", "point", big="Pomodoro solves it", keys=["Pomodoro"], emoji=[TOMATO, CHECK])

# ---------------- story ----------------
sec(28, "The Story", "green")
b(28, 28, "So where does this technique come from?", "فمن أين جاءت هذه التقنية؟", "emoji", "think", emoji=[THINK, SEARCH], labels=["Where from?"], keys=["where"])
b(29, 31, "In the late 1980s, an Italian university student named Francesco Cirillo was having the same problem you have.", "في أواخر الثمانينيات، كان طالب جامعي إيطالي اسمه فرانشيسكو تشيريلو يعاني من نفس مشكلتك.", "emoji", "point", emoji=[ITALY, STUDENT, CAL], labels=["Italy", "Francesco Cirillo", "Late 1980s"], keys=["Francesco", "Cirillo"])
b(32, 33, "He couldn't focus. He felt like he was studying all day without achieving anything.", "لم يكن يستطيع التركيز. كان يشعر أنه يدرس طوال اليوم دون أن يحقق شيئًا.", "emoji", "idle", emoji=[TIRED, BOOKS], labels=["Can't focus", "All day, no results"], keys=["focus"])
b(34, 35, "So one day he grabbed a small kitchen timer shaped like a tomato, and in Italian, tomato is pomodoro.", "فذات يوم أمسك مؤقّت مطبخ صغيرًا على شكل طماطم، والطماطم بالإيطالية تُسمّى بومودورو.", "word", "happy", big="POMODORO", labels=["= tomato in Italian"], emoji=[TOMATO], keys=["tomato", "pomodoro"], sfx="ding")
b(36, 38, "He challenged himself with a simple question: can I focus for just twenty-five minutes, without any distraction, without stopping?", "تحدّى نفسه بسؤال بسيط: هل أستطيع التركيز خمسًا وعشرين دقيقة فقط، دون أي تشتّت ودون توقف؟", "number", "think", value=25, unit=" min", labels=["No distraction. No stopping."], emoji=[TIMER, THINK], keys=["twenty-five"])
b(39, 39, "And he discovered that yes, he could.", "واكتشف أنه، نعم، يستطيع.", "title", "happy", big="YES, he could!", keys=["YES"], emoji=[CHECK, MUSCLE], sfx="ding")
b(40, 40, "And when he repeated it again and again, his productivity exploded.", "وعندما كرّرها مرة بعد مرة، انفجرت إنتاجيته.", "emoji", "surprised", emoji=[REPEAT, CHART, EXPLODE], labels=["Repeat", "Repeat", "Productivity!"], keys=["exploded"])
b(41, 44, "That little tomato timer became one of the most famous productivity methods in the world, used today by millions of students, writers, programmers and entrepreneurs.", "أصبح ذلك المؤقّت الصغير من أشهر طرق الإنتاجية في العالم، ويستخدمه اليوم ملايين الطلاب والكتّاب والمبرمجين وروّاد الأعمال.", "emoji", "happy", emoji=[STUDENT, PEN, COMPUTER, ROCKET], labels=["Students", "Writers", "Programmers", "Founders"], keys=["millions", "famous"])

# ---------------- how ----------------
sec(45, "How It Works", "blue")
b(45, 46, "Now let me explain exactly how it works, step by step, so you can start using it today.", "الآن دعني أشرح لك بالضبط كيف تعمل، خطوة بخطوة، لتبدأ استخدامها اليوم.", "steps", "point", labels=["Choose one task", "Timer: 25 minutes", "5-minute break", "Repeat x4, long break"], emoji=[TARGET, TIMER, WATER, REPEAT], keys=["step"])
b(47, 48, "First, you choose one task. Not five tasks, not your whole program, one clear task.", "أولًا، تختار مهمة واحدة. ليست خمس مهام، وليس برنامجك كله، بل مهمة واحدة واضحة.", "vs", "point", labels=["5 tasks", "ONE clear task"], emoji=[MASK, TARGET], keys=["one", "First"])
b(49, 51, "For example, solve the exercises of chapter two in mathematics, or memorize the first lesson in history, or summarize the philosophy lesson.", "مثلًا: حلّ تمارين الفصل الثاني في الرياضيات، أو احفظ الدرس الأول في التاريخ، أو لخّص درس الفلسفة.", "emoji", "point", emoji=[MATH, HISTORY, MEMO], labels=["Math ch. 2", "History lesson 1", "Philosophy summary"], keys=["example"])
b(52, 52, "The clearer the task, the easier it is for your brain to start.", "كلما كانت المهمة أوضح، كان أسهل على دماغك أن يبدأ.", "quote", "happy", big="The clearer the task, the easier it is to start", keys=["clearer", "easier"])
b(53, 54, "When you tell yourself, I'm going to study physics, that's vague, and vague goals create procrastination.", "عندما تقول لنفسك: سأدرس الفيزياء، فهذا غامض، والأهداف الغامضة تصنع التسويف.", "emoji", "think", emoji=[ZAP, THINK], labels=["\"Study physics\"", "Vague = procrastination"], keys=["vague", "procrastination"])
b(55, 56, "But when you say, I'm going to solve three exercises on electricity, your brain knows exactly what to do.", "لكن عندما تقول: سأحلّ ثلاثة تمارين في الكهرباء، يعرف دماغك بالضبط ماذا يفعل.", "vs", "happy", labels=["Study physics", "3 exercises on electricity"], emoji=[THINK, ZAP], keys=["exactly"])
b(57, 57, "Second, you set a timer for twenty-five minutes.", "ثانيًا، تضبط مؤقّتًا على خمس وعشرين دقيقة.", "number", "point", value=25, unit=":00", labels=["Set the timer"], emoji=[TIMER, TOMATO], keys=["Second", "timer"], sfx="windup")
b(58, 60, "And during these twenty-five minutes, you have one rule, and it's the most important rule of all: you do nothing except the task.", "وخلال هذه الدقائق الخمس والعشرين لديك قاعدة واحدة، وهي أهم قاعدة على الإطلاق: لا تفعل شيئًا غير المهمة.", "quote", "point", big="One rule: do nothing except the task", keys=["nothing", "task"])
b(61, 62, "No phone, no messages, no checking social media, no getting up to grab something from the kitchen.", "لا هاتف، لا رسائل، لا تصفّح لمواقع التواصل، ولا قيام لإحضار شيء من المطبخ.", "steps", "idle", labels=["No phone", "No messages", "No social media", "No kitchen trips"], emoji=[PHONE, MSG, TV, FOOD], keys=["No"])
b(63, 65, "If a thought comes to your mind, like I need to reply to my friend, or I should check something online,", "إذا خطرت ببالك فكرة، مثل: يجب أن أرد على صديقي، أو يجب أن أتحقق من شيء على الإنترنت،", "emoji", "think", emoji=[THINK, MSG, COMPUTER], labels=["A thought...", "Reply to friend", "Check online"], keys=["thought"])
b(66, 67, "you simply write it on a piece of paper next to you and you go back to work. You'll deal with it later.", "فقط اكتبها على ورقة بجانبك وعد إلى عملك. ستتعامل معها لاحقًا.", "emoji", "happy", emoji=[NOTEPAD, PEN], labels=["Write it down", "Later!"], keys=["write", "later"])
b(68, 68, "These twenty-five minutes are sacred.", "هذه الدقائق الخمس والعشرون مقدّسة.", "title", "point", big="25 minutes are SACRED", keys=["SACRED"], emoji=[SHIELD, TIMER], sfx="mj_hit")
b(69, 69, "Third, when the timer rings, you stop and you take a short break of five minutes.", "ثالثًا، عندما يرنّ المؤقّت، تتوقف وتأخذ استراحة قصيرة لمدة خمس دقائق.", "number", "happy", value=5, unit=" min", labels=["Short break"], emoji=[ALARM, RELAX], keys=["Third", "break"], sfx="ring")
b(70, 73, "And this break is real. You stand up, you drink water, you stretch, you look out of the window, you breathe.", "وهذه استراحة حقيقية: تقف، تشرب الماء، تتمدّد، تنظر من النافذة، وتتنفّس.", "emoji", "happy", emoji=[WATER, STRETCH, WINDOW], labels=["Drink water", "Stretch", "Look outside"], keys=["real"])
b(74, 75, "And here's an important tip: don't touch your phone during this break.", "وإليك نصيحة مهمة: لا تلمس هاتفك خلال هذه الاستراحة.", "vs", "point", labels=["Phone in the break", "Real rest"], emoji=[PHONE, RELAX], keys=["phone", "tip"])
b(76, 77, "Because if you open social media for five minutes, it's very easy for five minutes to become thirty,", "لأنك إذا فتحت مواقع التواصل لخمس دقائق، فمن السهل جدًا أن تصبح ثلاثين،", "number", "surprised", value=30, unit=" min", labels=["5 minutes became 30..."], emoji=[PHONE, SCREAM], keys=["thirty"])
b(78, 79, "and your brain doesn't actually rest. It's getting flooded with even more information.", "ودماغك لا يرتاح فعلًا، بل يغرق بمعلومات أكثر.", "emoji", "surprised", emoji=[BRAIN, WATER], labels=["No rest", "Flooded"], keys=["flooded"])
b(80, 80, "The goal of the break is to let your mind breathe, not to fill it with more noise.", "هدف الاستراحة أن تدع عقلك يتنفّس، لا أن تملأه بمزيد من الضجيج.", "quote", "happy", big="Let your mind breathe, not fill it with noise", keys=["breathe"])
b(81, 82, "Fourth, after the break, you start another twenty-five-minute session. Each one of these sessions is called a pomodoro.", "رابعًا، بعد الاستراحة تبدأ جلسة أخرى من خمس وعشرين دقيقة. وكل جلسة من هذه تُسمّى بومودورو.", "word", "point", big="1 session = 1 🍅", labels=["Each session is a pomodoro"], emoji=[TOMATO], keys=["Fourth", "pomodoro"])
b(83, 84, "And after you complete four pomodoros, you take a longer break, something like fifteen to thirty minutes.", "وبعد أن تُكمل أربع بومودورو، تأخذ استراحة أطول، من خمس عشرة إلى ثلاثين دقيقة.", "emoji", "happy", emoji=[TOMATO, TOMATO, TOMATO, TOMATO], labels=["1", "2", "3", "4 = long break!"], keys=["four", "longer"])
b(85, 86, "Eat something, walk a little, pray, talk to your family, relax. Then you come back and start a new cycle.", "كُل شيئًا، امشِ قليلًا، صلِّ، تحدّث مع عائلتك، استرخِ. ثم تعود وتبدأ دورة جديدة.", "emoji", "happy", emoji=[FOOD, WALK, PRAY, FAMILY], labels=["Eat", "Walk", "Pray", "Family"], keys=["cycle"])
b(87, 88, "That's it. It sounds simple, almost too simple.", "هذا كل شيء. تبدو بسيطة، بل بسيطة جدًا.", "title", "happy", big="That's it!", keys=["it"], emoji=[CHECK, SPARK])

# ---------------- why ----------------
sec(89, "Why It Works", "purple")
b(89, 91, "But let me explain why it works so well, because when you understand the reason, you'll believe in it and you'll actually stick to it.", "لكن دعني أشرح لماذا تنجح بهذا الشكل، لأنك عندما تفهم السبب ستؤمن بها وتلتزم بها فعلًا.", "emoji", "point", emoji=[BULB, HEART], labels=["Understand", "Stick to it"], keys=["why"])
b(92, 93, "The first reason is that it kills procrastination. Remember the mountain I talked about?", "السبب الأول أنها تقتل التسويف. تتذكر الجبل الذي حدّثتك عنه؟", "title", "point", big="#1 It kills procrastination", keys=["procrastination"], emoji=[MOUNTAIN, EXPLODE], sfx="mj_hit")
b(94, 96, "When you say I'm going to study for four hours, your brain panics. But when you say I'm just going to work for twenty-five minutes, your brain relaxes.", "عندما تقول سأدرس أربع ساعات، يرتعب دماغك. لكن عندما تقول سأعمل خمسًا وعشرين دقيقة فقط، يرتاح دماغك.", "vs", "happy", labels=["4 hours = panic", "25 minutes = relax"], emoji=[SCREAM, RELAX], keys=["panics", "relaxes"])
b(97, 98, "Twenty-five minutes is nothing. Anyone can do twenty-five minutes.", "خمس وعشرون دقيقة لا شيء. أي أحد يستطيع أن يعمل خمسًا وعشرين دقيقة.", "number", "happy", value=25, unit=" min", labels=["Anyone can do it"], emoji=[MUSCLE, HAPPY], keys=["Anyone"])
b(99, 99, "And the funny thing is, the hardest part of studying is always the beginning.", "والطريف أن أصعب جزء في الدراسة هو دائمًا البداية.", "emoji", "think", emoji=[FLAG, LADDER], labels=["The hardest part", "= starting"], keys=["hardest", "beginning"])
b(100, 101, "Once you start, you build momentum, and continuing becomes much easier. The Pomodoro Technique tricks your brain into starting.", "بمجرد أن تبدأ، تكتسب زخمًا، ويصبح الاستمرار أسهل بكثير. تقنية بومودورو تخدع دماغك ليبدأ.", "emoji", "happy", emoji=[ROCKET, BRAIN], labels=["Momentum", "Tricked into starting"], keys=["momentum", "tricks"])
b(102, 104, "The second reason is that it creates urgency. There's an idea called Parkinson's Law, which says that work expands to fill the time available for it.", "السبب الثاني أنها تخلق إحساسًا بالاستعجال. هناك فكرة تُسمّى قانون باركنسون: العمل يتمدّد ليملأ الوقت المتاح له.", "quote", "point", big="Work expands to fill the time available (Parkinson's Law)", keys=["urgency", "expands"])
b(105, 105, "If you give yourself the whole day to do one exercise, it will take the whole day.", "إذا أعطيت نفسك اليوم كله لحلّ تمرين واحد، فسيأخذ اليوم كله.", "emoji", "think", emoji=[CAL, TURTLE], labels=["1 exercise", "= the whole day"], keys=["whole"])
b(106, 108, "But when the clock is running and you know you only have twenty-five minutes, you become sharper, faster and more focused. You stop wasting time because the timer reminds you that time is limited.", "لكن عندما تعمل الساعة وتعرف أن لديك خمسًا وعشرين دقيقة فقط، تصبح أحدّ وأسرع وأكثر تركيزًا. وتتوقف عن إضاعة الوقت لأن المؤقّت يذكّرك أن الوقت محدود.", "emoji", "surprised", emoji=[TIMER, ZAP, TARGET], labels=["Sharper", "Faster", "More focused"], keys=["sharper", "faster", "focused"])
b(109, 109, "The third reason is that it protects your energy.", "السبب الثالث أنها تحمي طاقتك.", "title", "point", big="#3 It protects your energy", keys=["energy"], emoji=[BATT, SHIELD], sfx="mj_hit")
b(110, 112, "A lot of students think that studying for many hours without stopping means they're serious.", "كثير من الطلاب يظنّون أن الدراسة لساعات طويلة دون توقف تعني أنهم جادّون.", "emoji", "think", emoji=[HOURGLASS, STUDENT], labels=["Hours non-stop", "= serious?"], keys=["serious"])
b(113, 116, "But the truth is that your brain cannot keep the same level of focus for hours. After a while, you're reading the same line again and again and nothing enters your head. You're physically there, but mentally you're gone.", "لكن الحقيقة أن دماغك لا يستطيع الحفاظ على نفس مستوى التركيز لساعات. بعد فترة، تقرأ نفس السطر مرارًا ولا يدخل رأسك شيء. أنت حاضر بجسدك، لكن عقلك غائب.", "emoji", "idle", emoji=[BATT_LOW, ZZZ, BOOK], labels=["Focus drops", "Mentally gone", "Same line again"], keys=["truth", "gone"])
b(117, 118, "The regular breaks in the Pomodoro Technique let your brain recharge, so the quality of your focus stays high throughout the whole day.", "الاستراحات المنتظمة في تقنية بومودورو تُعيد شحن دماغك، فتبقى جودة تركيزك عالية طوال اليوم.", "emoji", "happy", emoji=[BATT_LOW, BATT], labels=["Break", "Recharged!"], keys=["recharge"])
b(119, 121, "It's better to study four hours with real focus than eight hours with your mind somewhere else.", "من الأفضل أن تدرس أربع ساعات بتركيز حقيقي بدلًا من ثماني ساعات وعقلك في مكان آخر.", "vs", "point", labels=["8 hours, mind elsewhere", "4 hours, real focus"], emoji=[ZZZ, TARGET], keys=["better", "focus"])
b(122, 122, "The fourth reason is that it lets you measure your work.", "السبب الرابع أنها تتيح لك قياس عملك.", "title", "point", big="#4 You can MEASURE it", keys=["MEASURE"], emoji=[CHART, RULER], sfx="mj_hit")
b(123, 125, "Instead of saying I studied a lot today, which means nothing, you can say I completed eight pomodoros today. That's real, that's measurable.", "بدل أن تقول درست كثيرًا اليوم، وهي جملة لا تعني شيئًا، يمكنك أن تقول أكملت ثماني بومودورو اليوم. هذا حقيقي وقابل للقياس.", "number", "happy", value=8, unit=" 🍅", labels=["Real. Measurable."], emoji=[CHECK, CHART], keys=["measurable"])
b(126, 127, "And when you can measure something, you can improve it. Maybe this week you do six pomodoros a day, and next week you aim for eight.", "وعندما تستطيع قياس شيء، تستطيع تحسينه. ربما هذا الأسبوع تعمل ست بومودورو يوميًا، والأسبوع القادم تستهدف ثماني.", "vs", "happy", labels=["This week: 6", "Next week: 8"], emoji=[TOMATO, CHART], keys=["improve"])
b(128, 129, "You start competing with yourself, and that feeling of progress is incredibly motivating.", "تبدأ بمنافسة نفسك، وذلك الشعور بالتقدّم محفّز بشكل لا يُصدَّق.", "emoji", "happy", emoji=[MEDAL, FIRE], labels=["Beat yourself", "Progress!"], keys=["progress", "motivating"])

# ---------------- mistakes ----------------
sec(130, "Mistakes to Avoid", "pink")
b(130, 133, "Now, let me talk to you about the mistakes that most students make when they try this technique, so that you don't fall into them.", "الآن دعني أحدّثك عن الأخطاء التي يقع فيها أغلب الطلاب عندما يجرّبون هذه التقنية، حتى لا تقع فيها.", "steps", "point", labels=["Phone too close", "Skipping breaks", "Breaking the session", "Tasks too big"], emoji=[PHONE, ZZZ, STOP, MOUNTAIN], keys=["mistakes"])
b(134, 135, "The first mistake is keeping the phone close. Brother, sister, listen to me.", "الخطأ الأول هو إبقاء الهاتف قريبًا منك. يا أخي، يا أختي، اسمعوني.", "title", "point", big="Mistake #1: Phone close", keys=["Phone"], emoji=[PHONE, CROSS], sfx="boom")
b(136, 138, "If your phone is on the desk, even face down, even on silent, part of your brain is thinking about it.", "إذا كان هاتفك على المكتب، حتى لو كان مقلوبًا، حتى لو كان صامتًا، فإن جزءًا من دماغك يفكّر فيه.", "emoji", "think", emoji=[PHONE, MUTE, BRAIN], labels=["Face down", "On silent", "Still thinking"], keys=["thinking"])
b(139, 141, "Studies have shown that just having your phone in sight reduces your ability to concentrate.", "أثبتت الدراسات أن مجرد وجود هاتفك أمام عينيك يقلّل قدرتك على التركيز.", "emoji", "surprised", emoji=[EYES, PHONE, CHART], labels=["In sight", "", "Focus goes down"], keys=["reduces", "concentrate"])
b(142, 144, "So put it in another room, give it to your mother, put it in a drawer, do whatever you need to do.", "فضعه في غرفة أخرى، أو أعطه لأمك، أو ضعه في درج، افعل ما يلزم.", "emoji", "happy", emoji=[DRAWER, MOM, WALK], labels=["Drawer", "Give it to mom", "Another room"], keys=["another"])
b(145, 146, "And if you use your phone as a timer, put it in airplane mode and keep it far away from your hands.", "وإذا كنت تستخدم هاتفك كمؤقّت، فضعه في وضع الطيران وأبعده عن يديك.", "emoji", "point", emoji=[PLANE, PHONE], labels=["Airplane mode", "Far away"], keys=["airplane"])
b(147, 149, "The second mistake is skipping the breaks. Some students feel motivated and say, I'm going to keep going, I don't need a break.", "الخطأ الثاني هو تخطّي الاستراحات. بعض الطلاب يشعرون بالحماس ويقولون: سأواصل، لا أحتاج استراحة.", "title", "think", big="Mistake #2: Skipping breaks", keys=["breaks"], emoji=[CROSS, RELAX], sfx="boom")
b(150, 152, "And that works once or twice, but after a few hours they burn out, and the next day they don't want to study at all.", "وهذا ينجح مرة أو مرتين، لكن بعد ساعات قليلة يحترقون، وفي اليوم التالي لا يريدون الدراسة أبدًا.", "emoji", "surprised", emoji=[FIRE, BATT_LOW, ZZZ], labels=["Burn out", "Empty", "No study tomorrow"], keys=["burn"])
b(153, 155, "The breaks are not a reward for being lazy. They are part of the system. Respect them.", "الاستراحات ليست مكافأة على الكسل، بل هي جزء من النظام. احترمها.", "quote", "point", big="Breaks are part of the system. Respect them.", keys=["system", "Respect"])
b(156, 159, "The third mistake is breaking the session. If you stop in the middle of a pomodoro to check a message, that pomodoro doesn't count. You start again from zero.", "الخطأ الثالث هو قطع الجلسة. إذا توقفت في منتصف البومودورو لتتفقد رسالة، فهذه البومودورو لا تُحتسب. تبدأ من الصفر.", "number", "surprised", value=0, unit=" 🍅", labels=["Check a message = start from ZERO"], emoji=[STOP, MSG], keys=["zero", "breaking"], sfx="boom")
b(160, 161, "Be strict with yourself here, because this rule is what trains your brain to focus. Every time you resist a distraction, you're making your focus muscle stronger.", "كن صارمًا مع نفسك هنا، لأن هذه القاعدة هي ما يدرّب دماغك على التركيز. كل مرة تقاوم فيها تشتّتًا، تقوّي عضلة تركيزك.", "emoji", "happy", emoji=[SHIELD, BRAIN, MUSCLE], labels=["Resist", "Train", "Stronger"], keys=["strict", "stronger"])
b(162, 164, "The fourth mistake is choosing tasks that are too big. If your task is finish the entire mathematics program, you'll feel overwhelmed and you'll never feel like you're making progress.", "الخطأ الرابع هو اختيار مهام كبيرة جدًا. إذا كانت مهمتك إنهاء برنامج الرياضيات كله، ستشعر بالإرهاق ولن تشعر أبدًا أنك تتقدّم.", "emoji", "surprised", emoji=[MOUNTAIN, MATH, SWEAT], labels=["Too big", "The whole program", "Overwhelmed"], keys=["big", "overwhelmed"])
b(165, 167, "Break big goals into small pieces. One lesson, one series of exercises, one summary. Small wins add up to big results.", "قسّم الأهداف الكبيرة إلى قطع صغيرة: درس واحد، سلسلة تمارين واحدة، ملخّص واحد. الانتصارات الصغيرة تصنع نتائج كبيرة.", "steps", "happy", labels=["One lesson", "One series of exercises", "One summary"], emoji=[BRICK, BRICK, TROPHY], keys=["small", "big"])

# ---------------- BAC ----------------
sec(168, "BAC Tips", "gold")
b(168, 170, "And now, let me give you some advice specifically for students preparing for the BAC, or for any important exam.", "والآن، دعني أعطيك نصائح خاصة بالطلاب الذين يحضّرون للبكالوريا أو لأي امتحان مهم.", "title", "point", big="BAC & big exams", keys=["BAC"], emoji=[GRAD, MEMO], sfx="mj_hit")
b(171, 175, "Plan your pomodoros the night before. Before you sleep, take paper and write down what you're going to study tomorrow and how many pomodoros you think each task needs.", "خطّط لبومودوروهاتك في الليلة السابقة. قبل النوم، خذ ورقة واكتب ماذا ستدرس غدًا وكم بومودورو تحتاج كل مهمة.", "emoji", "point", emoji=[MOON, NOTEPAD, TOMATO], labels=["The night before", "Write the plan", "🍅 per task"], keys=["Plan", "night"])
b(176, 177, "When you wake up, you don't waste energy deciding what to do. You just follow the plan.", "وعندما تستيقظ، لا تُضيّع طاقتك في التفكير ماذا تفعل. فقط اتبع الخطة.", "emoji", "happy", emoji=[SUNRISE, CHECK], labels=["Wake up", "Follow the plan"], keys=["plan"])
b(178, 178, "Put your hardest subjects at the beginning of the day, when your mind is fresh.", "ضع أصعب موادك في بداية اليوم، عندما يكون ذهنك صافيًا.", "emoji", "point", emoji=[SUN, BRAIN], labels=["Morning", "Hardest subject"], keys=["hardest", "fresh"])
b(179, 182, "If mathematics is difficult for you, don't leave it for the evening when you're tired. Do your first pomodoros on the subject that scares you the most, and keep the easier subjects for later.", "إذا كانت الرياضيات صعبة عليك، فلا تتركها للمساء وأنت متعب. اجعل أول بومودوروهاتك للمادة التي تخيفك أكثر، واترك المواد الأسهل لاحقًا.", "vs", "point", labels=["Math in the evening", "Math first!"], emoji=[TIRED, MATH], keys=["scares", "first"])
b(183, 184, "Mix active learning into your sessions. Don't just read.", "امزج التعلّم النشط في جلساتك. لا تكتفِ بالقراءة.", "title", "point", big="Don't just READ", keys=["READ"], emoji=[BOOK, CROSS])
b(185, 187, "Solve exercises, write summaries, explain the lesson out loud as if you're teaching it to someone else, test yourself without looking at the book.", "حلّ التمارين، اكتب الملخّصات، اشرح الدرس بصوت عالٍ كأنك تعلّمه لشخص آخر، واختبر نفسك دون النظر إلى الكتاب.", "steps", "happy", labels=["Solve exercises", "Write summaries", "Teach it out loud", "Test yourself"], emoji=[PEN, MEMO, TEACH, SEARCH], keys=["Solve", "explain", "test"])
b(188, 188, "A pomodoro of active work is worth much more than a pomodoro of passive reading.", "بومودورو واحدة من العمل النشط تساوي أكثر بكثير من بومودورو من القراءة السلبية.", "vs", "point", labels=["Passive reading", "Active work"], emoji=[ZZZ, FIRE], keys=["active", "passive"])
b(189, 190, "And finally, adapt the technique to yourself. Twenty-five minutes is the classic version, but it's not a law.", "وأخيرًا، كيّف التقنية حسب نفسك. خمس وعشرون دقيقة هي النسخة الكلاسيكية، لكنها ليست قانونًا.", "title", "happy", big="Adapt it to YOU", keys=["YOU"], emoji=[KEY, TIMER])
b(191, 194, "If you find that twenty-five minutes is too short and you get interrupted just when you're getting into deep focus, you can try longer sessions with slightly longer breaks.", "إذا وجدت أن خمسًا وعشرين دقيقة قصيرة جدًا وتنقطع بالضبط حين تدخل في تركيز عميق، يمكنك تجربة جلسات أطول مع استراحات أطول قليلًا.", "emoji", "think", emoji=[TIMER, TARGET], labels=["Too short?", "Go longer"], keys=["longer"])
b(195, 196, "And if twenty-five minutes feels too long at the beginning, start with fifteen and build up slowly.", "وإذا بدت لك خمس وعشرون دقيقة طويلة في البداية، فابدأ بخمس عشرة وزِد تدريجيًا.", "number", "happy", value=15, unit=" min", labels=["Start small, build up"], emoji=[SEED, LADDER], keys=["fifteen", "slowly"])
b(197, 198, "The goal is not to follow the rule perfectly. The goal is to build a habit of deep focus that works for you.", "الهدف ليس اتباع القاعدة بشكل مثالي، بل بناء عادة تركيز عميق تناسبك.", "quote", "point", big="Build a habit of deep focus that works for YOU", keys=["habit", "focus"])

# ---------------- consistency ----------------
sec(199, "Be Consistent", "green")
b(199, 199, "Let me tell you something before we finish.", "دعني أقول لك شيئًا قبل أن ننتهي.", "emoji", "point", emoji=[BULB], labels=["One last thing"], keys=["finish"])
b(200, 201, "The students who succeed are not always the smartest ones. Very often, they're the ones who are consistent.", "الطلاب الناجحون ليسوا دائمًا الأذكى. في أغلب الأحيان، هم الأكثر مواظبة.", "vs", "point", labels=["The smartest", "The CONSISTENT"], emoji=[BRAIN, MEDAL], keys=["consistent"])
b(202, 203, "The ones who show up every day, sit down, and do their pomodoros even when they don't feel like it.", "الذين يحضرون كل يوم، ويجلسون، ويُنجزون بومودوروهاتهم حتى عندما لا يشعرون بالرغبة.", "emoji", "happy", emoji=[CAL, TOMATO, MUSCLE], labels=["Every day", "Sit down", "Do it anyway"], keys=["every"])
b(204, 205, "Motivation comes and goes. Some days you'll wake up full of energy, and some days you'll feel tired and lost.", "الحماس يأتي ويذهب. بعض الأيام تستيقظ مليئًا بالطاقة، وبعضها تشعر بالتعب والضياع.", "vs", "think", labels=["Full of energy", "Tired and lost"], emoji=[FIRE, TIRED], keys=["Motivation"])
b(206, 207, "But a system doesn't depend on your mood. When you have a system, you don't need to feel motivated.", "لكن النظام لا يعتمد على مزاجك. عندما يكون لديك نظام، لا تحتاج أن تشعر بالحماس.", "quote", "point", big="A system doesn't depend on your mood", keys=["system", "mood"])
b(208, 210, "You just start the timer and you do the first pomodoro. And then the second. And then the third.", "فقط شغّل المؤقّت وأنجز البومودورو الأولى. ثم الثانية. ثم الثالثة.", "steps", "happy", labels=["Start the timer", "Pomodoro 1", "Pomodoro 2", "Pomodoro 3"], emoji=[TIMER, TOMATO, TOMATO, TOMATO], keys=["first", "second", "third"])
b(211, 211, "And before you know it, you've done a full day of real, focused work.", "وقبل أن تشعر، تكون قد أنجزت يومًا كاملًا من العمل الحقيقي المركّز.", "title", "happy", big="A full day of real work", keys=["real"], emoji=[TROPHY, SPARK], sfx="sparkle")
b(212, 213, "Imagine yourself a few months from now. Imagine that every single day you completed eight focused pomodoros.", "تخيّل نفسك بعد بضعة أشهر. تخيّل أنك أكملت كل يوم ثماني بومودورو مركّزة.", "number", "think", value=8, unit=" 🍅/day", labels=["Every single day"], emoji=[CAL, THINK], keys=["Imagine"])
b(214, 215, "That's hundreds of hours of real study. Hundreds of exercises solved, dozens of lessons mastered.", "هذا يعني مئات الساعات من الدراسة الحقيقية، ومئات التمارين المحلولة، وعشرات الدروس المتقنة.", "number", "surprised", value=400, unit="+ h", labels=["Hundreds of hours"], emoji=[BOOKS, HUNDRED], keys=["hundreds", "Hundreds"])
b(216, 217, "Imagine walking into your exam room knowing that you prepared, knowing that you did everything you could.", "تخيّل أنك تدخل قاعة الامتحان وأنت تعرف أنك حضّرت جيدًا، وأنك فعلت كل ما بوسعك.", "emoji", "happy", emoji=[GRAD, MUSCLE], labels=["Exam day", "Ready"], keys=["prepared"])
b(218, 218, "That feeling is priceless, and it starts with one small decision today.", "ذلك الشعور لا يُقدَّر بثمن، ويبدأ بقرار صغير واحد اليوم.", "quote", "happy", big="It starts with one small decision today", keys=["today", "decision"])

# ---------------- challenge ----------------
sec(219, "Your Challenge", "night")
b(219, 220, "So here's my challenge for you. Today, not tomorrow. Today, choose one task,", "إليك تحدّيّ لك: اليوم، وليس غدًا. اليوم، اختر مهمة واحدة،", "title", "point", big="Challenge: TODAY", keys=["TODAY"], emoji=[TARGET, FIRE], sfx="boom")
b(221, 222, "put your phone away, set your timer, and complete one pomodoro. Just one.", "أبعد هاتفك، اضبط مؤقّتك، وأكمل بومودورو واحدة. واحدة فقط.", "steps", "point", labels=["One task", "Phone away", "Set the timer", "Just ONE pomodoro"], emoji=[TARGET, PHONE, TIMER, TOMATO], keys=["one", "Just"])
b(223, 223, "Then come back here and write in the comments: I did my first pomodoro.", "ثم عد إلى هنا واكتب في التعليقات: أنجزت أول بومودورو لي.", "word", "happy", big="\"I did my first pomodoro\"", labels=["Write it in the comments 👇"], emoji=[MSG], keys=["comments"])
b(224, 225, "And if you want to go further, try to complete four pomodoros today and tell me how you felt.", "وإذا أردت أن تذهب أبعد، حاول أن تُكمل أربع بومودورو اليوم وأخبرني بما شعرت.", "emoji", "happy", emoji=[TOMATO, TOMATO, TOMATO, TOMATO], labels=["", "", "", "Tell me!"], keys=["four"])
b(226, 228, "If this video helped you, share it with a friend who always says I'll start studying tomorrow, because he needs it more than anyone.", "إذا ساعدك هذا الفيديو، شاركه مع صديق يقول دائمًا: سأبدأ الدراسة غدًا، لأنه يحتاجه أكثر من أي أحد.", "emoji", "point", emoji=[SHARE, FRIENDS], labels=["Share it", "\"I'll start tomorrow\""], keys=["share"], sfx="swipe")
b(229, 230, "And subscribe, because on this channel we're going to keep working together, step by step, until you reach your goals.", "واشترك في القناة، لأننا سنواصل العمل معًا هنا خطوة بخطوة حتى تصل إلى أهدافك.", "emoji", "wave", emoji=[BELL, LADDER, TROPHY], labels=["Subscribe", "Step by step", "Your goals"], keys=["subscribe"], sfx="ding")
b(231, 232, "Remember, you don't need more time. You need more focus.", "تذكّر: أنت لا تحتاج وقتًا أكثر، بل تحتاج تركيزًا أكثر.", "vs", "point", labels=["More time", "MORE FOCUS"], emoji=[HOURGLASS, TARGET], keys=["focus"])
b(233, 234, "And now you have the tool. Start the timer, and let's get to work.", "والآن لديك الأداة. شغّل المؤقّت، ولنبدأ العمل.", "title", "happy", big="Start the timer. Let's work!", keys=["work", "timer"], emoji=[TOMATO, ROCKET], sfx="mj_hit")

PROMO_CAP = 28  # subscribe + follow right after the intro (~1:05)

THUMB = {
    "lines": [
        {"text": "THE 25-MINUTE", "size": 104, "gold": False},
        {"text": "STUDY TRICK", "size": 112, "gold": True},
        {"text": "Pomodoro Technique", "size": 62, "gold": False},
    ],
    "emoji": [TOMATO, TIMER, BRAIN],
}


def main():
    caps = json.load(open(sys.argv[1]))
    beats = []
    for x in B:
        s = caps[x["i0"]][1]
        e = caps[x["i1"]][2]
        d = {k: v for k, v in x.items() if k not in ("i0", "i1")}
        beats.append({"start": round(s, 2), "end": round(e, 2), **d})
    for a, c in zip(beats, beats[1:]):
        a["end"] = min(a["end"], c["start"])
    secs = [{"at": round(max(0, caps[i][1] - 0.05), 2) if i else 0, "title": t, "pal": p} for i, t, p in S]
    codes = set(THUMB["emoji"])
    for x in beats:
        codes.update(x.get("emoji", []))
    src = os.path.join(ROOT, "node_modules/@twemoji/svg")
    dst = os.path.join(ROOT, "public/yt6/img")
    os.makedirs(dst, exist_ok=True)
    for c in sorted(codes):
        p = os.path.join(src, c + ".svg")
        if not os.path.exists(p):
            sys.exit("missing emoji " + c)
        shutil.copy(p, os.path.join(dst, c + ".svg"))
    out = os.path.join(ROOT, "src/yt6/script.ts")
    with open(out, "w") as f:
        f.write("// Generated by scripts/yt6_script.py - one beat per sentence (seconds of public/yt6/voice.wav).\n")
        f.write('import type { POSES } from "../mascot/Owl";\n\n')
        f.write(
            "export type Beat = {\n  start: number;\n  end: number;\n  en: string;\n  ar: string;\n"
            '  kind: "title" | "emoji" | "vs" | "steps" | "number" | "quote" | "word";\n'
            "  pose?: keyof typeof POSES;\n  big?: string;\n  keys?: string[];\n  emoji?: string[];\n  labels?: string[];\n"
            "  value?: number;\n  unit?: string;\n  sfx?: string | null;\n};\n\n"
        )
        f.write('export type Pal = "gold" | "blue" | "pink" | "green" | "purple" | "night";\n')
        f.write("export const SECTIONS: { at: number; title: string; pal: Pal }[] = " + json.dumps(secs, ensure_ascii=False, indent=1) + ";\n\n")
        f.write(f"export const PROMO_AT = {round(caps[PROMO_CAP][1], 2)};\n\n")
        f.write("export const BEATS: Beat[] = " + json.dumps(beats, ensure_ascii=False, indent=1) + ";\n\n")
        f.write("export const THUMB = " + json.dumps(THUMB, ensure_ascii=False, indent=1) + ";\n")
    print(len(beats), "beats,", len(codes), "emoji ->", out)


main()
