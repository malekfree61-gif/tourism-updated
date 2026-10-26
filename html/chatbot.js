/* ExoToura Guide - floating round chat assistant.
   Works offline with a built-in bilingual (Arabic/English) knowledge base built from the site
   + PROJECT_DOCUMENTATION.md + data.json. If /api/chat exists (Vercel function with
   ANTHROPIC_API_KEY) it upgrades automatically to a real AI model, using the same knowledge as context. */
(function () {
  "use strict";
  if (window.__exoChatLoaded) return;
  window.__exoChatLoaded = true;

  var me = document.currentScript;
  var BASE = me && me.src ? me.src.replace(/[^\/]*$/, "") : "";
  var API = (me && me.getAttribute("data-api")) || "/api/chat";

  /* ---------- helpers ---------- */
  function norm(s) {
    return String(s || "").toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
      .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
      .replace(/ؤ/g, "و").replace(/ئ/g, "ي")
      .replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  }
  function isAr(s) { return /[\u0600-\u06FF]/.test(s); }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---------- knowledge base: E(keywords, arabic, english, links[[file, labelAr, labelEn]]) ---------- */
  var KB = [];
  function E(id, kw, ar, en, links, w) { KB.push({ id: id, kw: kw.map(norm), ar: ar, en: en, links: links || [], w: w || 1 }); }

  E("greet", ["اهلا", "هاي", "مرحبا", "السلام", "ازيك", "صباح", "مساء", "hello", "hi", "hey", "good morning", "good evening"],
    "أهلاً بيك في ExoToura! 👋 أنا مرشدك السياحي الذكي. اسألني عن الأماكن الأثرية، المحافظات، الحجز، الـ VR، الورش أو أي صفحة في الموقع.",
    "Welcome to ExoToura! 👋 I'm your smart travel guide. Ask me about archaeological sites, governorates, booking, VR, workshops, or any page on the site.");
  E("thanks", ["شكرا", "تسلم", "ميرسي", "thanks", "thank you", "thx"],
    "العفو! لو عايز أي حاجة تانية عن مصر أو الموقع أنا موجود 🌟", "You're welcome! Ask me anything else about Egypt or the site 🌟");
  E("who", ["انت مين", "انت ايه", "who are you", "what are you", "your name", "اسمك"],
    "أنا مرشد ExoToura، مساعد ذكي بيساعدك تفهم الموقع وتتعرف على السياحة والأماكن الأثرية في مصر.",
    "I'm the ExoToura Guide, an AI assistant that helps you understand the site and discover tourism and archaeological places in Egypt.");

  E("about", ["عن الموقع", "الموقع ده", "اكسوتورا", "exotoura", "exatoura", "ايه ده", "what is this", "about the site", "about this site", "about exotoura", "فكره الموقع", "فكره المشروع", "المشروع", "project idea", "مميزات", "features"],
    "**ExoToura** منصة سياحية مصرية هدفها إن السياحة في مصر تكون متاحة للجميع مهما كانت قدرته على السفر أو ظروفه المادية. أهم المميزات:\n• 🎟️ حجز تذاكر وباقات سياحية أونلاين (تذكرة على الموبايل بدل الطوابير)\n• 👓 تجربة VR لزيارة الأماكن افتراضياً\n• ♿ دعم ذوي الاحتياجات الخاصة مع متطوعين\n• 📸 ورش تصوير في المحافظات\n• 🤝 برنامج تطوع (مرشد، مصور، مساعد ورش)\n• 🗺️ خريطة تفاعلية للـ 27 محافظة\n• 📚 مكتبة عن مصر",
    "**ExoToura** is an Egyptian tourism platform that makes Egypt accessible to everyone, whatever their ability to travel or financial situation. Key features:\n• 🎟️ Online tickets and tour packages (show the ticket on your phone, no queues)\n• 👓 VR experiences to visit places virtually\n• ♿ Disability support with volunteers\n• 📸 Photography workshops across governorates\n• 🤝 Volunteer program (guide, photographer, workshop assistant)\n• 🗺️ Interactive map of all 27 governorates\n• 📚 A library about Egypt",
    [["about_us.html", "من نحن", "About us"], ["Company.html", "الشركة", "Company"]]);
  E("team", ["الفريق", "team", "مين عمل", "who made", "who built", "ادم", "adam", "معاذ", "moaz", "مالك", "malek", "kamal", "كمال", "يوسف", "yossef", "yousef", "مطور", "developer", "المصمم", "designer"],
    "الفريق اسمه **Team ExoToura** وفيه 5 أعضاء:\n• آدم وسام: قائد المشروع ومطوّر ويب\n• معاذ أحمد: مدير المشروع ومطوّر ويب\n• مالك أحمد: مصمم UI/UX ومطوّر ويب\n• محمد كمال: مطوّر ويب\n• يوسف: مطوّر ويب",
    "The team is **Team ExoToura**, five members:\n• Adam Wessam: Project Leader & Web Developer\n• Moaz Ahmed: Project Manager & Web Developer\n• Malek Ahmed: UI/UX Designer & Web Developer\n• Mohamed Kamal: Web Developer\n• Yossef: Web Developer",
    [["team.html", "صفحة الفريق", "Team page"]]);
  E("vision", ["رؤيه", "رسالة", "رساله", "vision", "mission", "هدفكم", "goal", "ليه الموقع"],
    "**الرؤية:** إن كل شخص يقدر يستمتع بجمال مصر السياحي مهما كانت قدرته على السفر أو ظروفه المادية.\n**الرسالة:** نضمن إن أي سائح، مهما كانت إمكانياته أو قدراته البدنية، ما يفوّتش أي حاجة رائعة في مصر.",
    "**Vision:** to make tourism in Egypt accessible to everyone, regardless of ability to travel or financial situation.\n**Mission:** to ensure every tourist, whatever their means or physical abilities, can enjoy Egypt's attractions and miss nothing wonderful.",
    [["about_us.html", "من نحن", "About us"]]);
  E("booking", ["حجز", "احجز", "حجوزات", "تذكره", "تذاكر", "تيكت", "book", "booking", "ticket", "tickets", "reserve"],
    "للحجز: افتح صفحة **حجز التذاكر**، اختار جنسية/أصل السائح (مصري، خليجي، أوروبي، أمريكي)، المحافظة، تاريخ الرحلة وعدد التذاكر، واضغط Confirm Booking هتظهر لك تذكرتك بالسعر الإجمالي. تقدر تعرض التذكرة على موبايلك عند المدخل.",
    "To book: open the **Ticket Booking** page, choose the tourist origin (Egyptian, Gulf, European, American), destination governorate, trip date and number of tickets, then press Confirm Booking to get your ticket with the total price. You can show it on your phone at the entrance.",
    [["book-ticket.html", "احجز تذكرتك", "Book a ticket"], ["all-packages.html", "كل الباقات", "All packages"]]);
  E("prices", ["سعر", "اسعار", "بكام", "تكلفه", "كام", "price", "prices", "cost", "how much", "fees", "pricing"],
    "أسعار التذكرة الأساسية للمصريين (جنيه): القاهرة 200، الجيزة 220، الإسكندرية 250، مطروح 480، البحر الأحمر 550، جنوب سيناء 600، شمال سيناء 500، أسوان 500، الأقصر 450، المنيا 320، الفيوم 280.\nبتتضاعف حسب الأصل: خليجي ×1.3، أوروبي ×1.6، أمريكي ×2.\nوالباقات بتبدأ من 5,000 جنيه (الإسكندرية) لحد 15,000 (الكروز النيلي).",
    "Base ticket prices for Egyptians (EGP): Cairo 200, Giza 220, Alexandria 250, Matrouh 480, Red Sea 550, South Sinai 600, North Sinai 500, Aswan 500, Luxor 450, Minya 320, Fayoum 280.\nMultipliers by origin: Gulf ×1.3, European ×1.6, American ×2.\nPackages start from 5,000 EGP (Alexandria) up to 15,000 EGP (Royal Nile Cruise).",
    [["book-ticket.html", "جدول الأسعار", "Price table"], ["all-packages.html", "الباقات", "Packages"]]);
  E("packages", ["باقه", "باقات", "package", "packages", "رحله", "رحلات", "tour", "tours", "عروض", "offers"],
    "الباقات المتاحة (بتبدأ من):\n• تجربة أهرامات الجيزة: 8,000 جنيه\n• جولة معابد الأقصر: 10,000\n• الكروز النيلي الملكي: 15,000\n• جنة البحر الأحمر: 7,000\n• جولة الإسكندرية الساحلية: 5,000\n• تجربة أسوان النوبية: 9,000\n• مغامرة جبال سيناء: 12,000\n• هروب واحة الفيوم: 6,000",
    "Available packages (from):\n• Giza Pyramids Experience: 8,000 EGP\n• Luxor Temples Tour: 10,000\n• Royal Nile Cruise: 15,000\n• Red Sea Paradise: 7,000\n• Alexandria Coastal Tour: 5,000\n• Aswan Nubian Experience: 9,000\n• Sinai Mountain Adventure: 12,000\n• Fayoum Oasis Escape: 6,000",
    [["all-packages.html", "كل الباقات", "All packages"]]);
  E("vr", ["vr", "واقع افتراضي", "الواقع الافتراضي", "نظارات", "نظاره", "virtual reality", "افتراضي", "virtual tour", "3d"],
    "خدمة **VR** (مدفوعة) بتخليك تزور الأهرامات ووادي الملوك ومعبد الكرنك افتراضياً بنظارات ثلاثية الأبعاد، وهي مفيدة لمن يصعب عليه السفر أو يتجنب الحر. وبتُستخدم كمان في التعليم والعلاج النفسي والتخفيف من التوتر.",
    "The **VR** service (paid) lets you visit the Giza Pyramids, Valley of the Kings and Karnak Temple virtually with 3D glasses. It's great for people who find travel hard or avoid the heat, and is also used for education and stress relief.",
    [["vr.html", "صفحة الـ VR", "VR page"]]);
  E("disability", ["اعاقه", "ذوي الاحتياجات", "احتياجات خاصه", "اشخاص ذوي", "disab", "accessib", "wheelchair", "كرسي متحرك", "special needs", "ذوى", "دعم", "inclusive", "مساعده للمعاقين"],
    "الموقع فيه نظام دعم لذوي الاحتياجات الخاصة: متطوعين بيرافقوا الزائر في رحلته بعد مراجعة السيرة الذاتية للتأكد إنهم مناسبين. الخدمات: دعم الحركة والتنقل، المساعدة في التوظيف، وبرامج مجتمعية وورش. الهدف إن كل الأماكن السياحية تكون متاحة للجميع.",
    "The site has a dedicated support system for people with special needs: volunteers accompany visitors on their trip, after their CVs are reviewed to make sure they are suitable. Services include mobility support, employment assistance and community programs. The goal is to make every attraction accessible to all.",
    [["disabilty.html", "صفحة الدعم", "Support page"], ["volunteers.html", "التطوع", "Volunteering"]]);
  E("volunteer", ["متطوع", "تطوع", "volunteer", "volunteering", "اتطوع"],
    "برنامج التطوع فيه 3 أدوار في كل المحافظات:\n1) **مرشد سياحي**: يرافق الزوار في الورش والجولات (ساعات مرنة)\n2) **مصور**: يوثّق لحظات الورش وتجارب السياح (3-5 ساعات)\n3) **مساعد ورش**: ينظّم الورش (2-4 ساعات)\nتقدر تقدّم من فورم Request a Volunteer أو تراسل volunteer@exatoura.com.",
    "The volunteer program has 3 roles across all governorates:\n1) **Tour Guide Volunteer**: guides visitors in workshops/tours (flexible hours)\n2) **Photography Volunteer**: captures workshop moments (3-5 hours)\n3) **Workshop Assistant**: helps organize workshops (2-4 hours)\nUse the Request a Volunteer form or email volunteer@exatoura.com.",
    [["volunteers.html", "صفحة التطوع", "Volunteer page"]]);
  E("workshops", ["ورش", "ورشه", "ورشة", "workshop", "workshops", "تصوير", "photography", "فخار", "pottery", "تعلم"],
    "ورش التصوير متاحة في محافظات مصر (الـ 27). أمثلة:\n• القاهرة: شارع المعز، 3 ساعات\n• الجيزة: منطقة الأهرامات، 3 ساعات\n• الإسكندرية: الكورنيش، ساعتين\n• البحر الأحمر: تصوير تحت الماء، مارينا الغردقة، 4 ساعات\n• الأقصر: معبد الكرنك، 3 ساعات\n• أسوان: القرية النوبية، 3 ساعات\n• الفيوم: تصوير الطبيعة\nفيه كمان تجربة لبس الزي المصري/النوبي وصناعة الفخار.",
    "Photography workshops run across Egypt's governorates (all 27). Examples:\n• Cairo: Al-Muizz Street, 3h\n• Giza: Pyramids area, 3h\n• Alexandria: Corniche, 2h\n• Red Sea: underwater photography, Hurghada Marina, 4h\n• Luxor: Karnak Temple, 3h\n• Aswan: Nubian Village, 3h\n• Fayoum: nature photography\nThere's also a traditional Egyptian/Nubian dress and pottery experience.",
    [["workshop.html", "صفحة الورش", "Workshops page"]]);
  E("map", ["خريطه", "الخريطه", "map", "interactive map", "المحافظات", "governorates", "27"],
    "الخريطة التفاعلية بتعرض الـ 27 محافظة. اضغط على أي علامة (marker) تفتح لك صفحة المحافظة فيها الوصف والأماكن السياحية وأماكن الخروج. ممكن كمان تسألني عن أي محافظة بالاسم.",
    "The interactive map shows all 27 governorates. Click any marker to open that governorate's page with its description, attractions and popular hangouts. You can also just ask me about any governorate by name.",
    [["project.html", "افتح الخريطة", "Open the map"]]);
  E("contact", ["تواصل", "اتصل", "اتواصل", "contact", "email", "ايميل", "رقم", "تليفون", "phone", "واتس", "inquire", "استفسار", "support", "عنوان", "address"],
    "للتواصل:\n• 📧 info@visit-egypt.com\n• 📞 +20 102 488 6690\n• 📍 القاهرة، مصر\nأو استخدم فورم الاستفسار في صفحة Contact. للتطوع: volunteer@exatoura.com.",
    "Contact us:\n• 📧 info@visit-egypt.com\n• 📞 +20 102 488 6690\n• 📍 Cairo, Egypt\nOr use the form on the Contact page. For volunteering: volunteer@exatoura.com.",
    [["contact.html", "صفحة التواصل", "Contact page"]]);
  E("login", ["تسجيل دخول", "تسجيل", "login", "log in", "sign up", "signup", "حساب", "account", "register", "دخول"],
    "تقدر تسجّل دخولك من صفحة **Login**، ولو معندكش حساب اعمل واحد من **Sign up** (الاسم الأول والأخير والإيميل وكلمة السر).",
    "Log in from the **Login** page, or create an account on **Sign up** (first and last name, email and password).",
    [["login.html", "تسجيل الدخول", "Login"], ["signup.html", "إنشاء حساب", "Sign up"]]);
  E("library", ["مكتبه", "المكتبه", "library", "كتب", "كتاب", "books", "book", "قراءه", "reading"],
    "المكتبة فيها كتب عن مصر القديمة:\n• The Rise and Fall of Ancient Egypt (Toby Wilkinson)\n• The Complete Pyramids (Mark Lehner)\n• Temples, Tombs, and Hieroglyphs (Barbara Mertz)",
    "The library features books on ancient Egypt:\n• The Rise and Fall of Ancient Egypt (Toby Wilkinson)\n• The Complete Pyramids (Mark Lehner)\n• Temples, Tombs, and Hieroglyphs (Barbara Mertz)",
    [["library.html", "افتح المكتبة", "Open library"]]);
  E("future", ["مستقبل", "المستقبل", "future", "hidden gems", "اماكن مخفيه", "لعبه", "العاب", "game", "games", "offline", "اوفلاين", "voice assistant", "مساعد صوتي", "خطط"],
    "خطط الفريق للمستقبل: صفحة **الجواهر المخفية** للأماكن غير المشهورة، لعبة أطفال تعليمية (بازل يظهر بعده معلم سياحي بشكل كرتوني)، مساعد صوتي للمكفوفين، وبرنامج سياحي يعمل أوفلاين بالكامل.",
    "The team's future plans: a **Hidden Gems** page for lesser-known places, an educational puzzle game for kids (completing it reveals a landmark in cartoon form), a voice assistant for visually impaired users, and a fully offline tourism program.");
  E("pages", ["ازاي استخدم", "how to use", "الصفحات", "pages", "القايمه", "menu", "navigation", "اروح فين", "where is", "sections"],
    "صفحات الموقع:\n• Home: الرئيسية\n• Company: الشركة والباقات\n• Disability: دعم ذوي الاحتياجات\n• Volunteer: التطوع\n• Workshops: ورش التصوير\n• VR: الواقع الافتراضي\n• Library: المكتبة\n• About / Team: من نحن والفريق\n• Inquire: تواصل معنا\n• Login: تسجيل الدخول",
    "Site pages:\n• Home\n• Company: company and packages\n• Disability: accessibility support\n• Volunteer\n• Workshops: photography workshops\n• VR: virtual reality\n• Library\n• About / Team\n• Inquire: contact us\n• Login",
    [["index.html", "الرئيسية", "Home"], ["Company.html", "الشركة", "Company"]]);

  /* ---- Egypt tourism & archaeology ---- */
  E("egypt", ["عن مصر", "about egypt", "egypt facts", "اثريه", "الاثريه", "اماكن اثريه", "اماكن سياحيه", "archaeolog", "top sites", "top places", "landmarks", "معالم", "اشهر الاماكن", "best places", "معلومات عن مصر", "مصر", "egypt"],
    "مصر مهد الحضارات: أكثر من 7,000 سنة تاريخ، أهرامات ومعابد على النيل، شواطئ البحر الأحمر وسيناء، صحاري وواحات، ومدن إسلامية وقبطية. أشهر وجهات الآثار: الجيزة، سقارة، الأقصر، أسوان، الإسكندرية. اسألني عن أي مكان!",
    "Egypt is a cradle of civilization: 7,000+ years of history, pyramids and temples along the Nile, Red Sea and Sinai coasts, deserts and oases, plus Islamic and Coptic cities. Top archaeological regions: Giza, Saqqara, Luxor, Aswan, Alexandria. Ask me about any place!",
    [["project.html", "الخريطة", "Map"]], 0.5);
  E("giza", ["هرم", "اهرام", "الاهرامات", "pyramid", "pyramids", "الجيزه", "giza", "خوفو", "khufu", "خفرع", "khafre", "منكاورع", "menkaure", "ابو الهول", "sphinx"],
    "**أهرامات الجيزة** (القاهرة الكبرى): هرم خوفو الأكبر عمره حوالي 4,500 سنة وهو العجيبة الوحيدة الباقية من عجائب الدنيا السبع القديمة، بجانبه هرما خفرع ومنكاورع وتمثال **أبو الهول**. نصيحة: روح بدري الصبح لتفادي الزحمة والحر، وتقدر تدخل داخل الهرم بتذكرة منفصلة. باقة \"Giza Pyramids Experience\" بتبدأ من 8,000 جنيه.",
    "**Giza Pyramids** (Greater Cairo): the Great Pyramid of Khufu is about 4,500 years old and the only surviving wonder of the ancient world, beside the pyramids of Khafre and Menkaure and the **Great Sphinx**. Tip: go early morning to avoid crowds and heat; entering inside a pyramid needs a separate ticket. The Giza Pyramids Experience package starts from 8,000 EGP.",
    [["Company.html", "باقة الجيزة", "Giza package"], ["book-ticket.html", "احجز", "Book"]]);
  E("gem", ["المتحف المصري الكبير", "grand egyptian museum", "gem", "توت عنخ امون", "توت", "tutankhamun", "tut", "king tut"],
    "**المتحف المصري الكبير (GEM)** قريب من هضبة الأهرامات، من أكبر المتاحف الأثرية في العالم، ويضم مجموعة الملك **توت عنخ آمون** كاملة وتمثال رمسيس الثاني الضخم. محتاج نص يوم على الأقل.",
    "The **Grand Egyptian Museum (GEM)** sits near the Giza Plateau and is one of the world's largest archaeological museums. It displays the complete **Tutankhamun** collection and a colossal Ramses II statue. Allow at least half a day.", [], 1.1);
  E("museum", ["المتحف المصري", "متحف التحرير", "egyptian museum", "tahrir", "التحرير", "المومياوات", "mummies", "royal mummies", "متحف الحضاره", "nmec"],
    "**المتحف المصري بالتحرير** (افتُتح 1902) فيه عشرات الآلاف من القطع الفرعونية. وفي الفسطاط **المتحف القومي للحضارة المصرية** بيعرض المومياوات الملكية في قاعة مخصصة.",
    "The **Egyptian Museum in Tahrir** (opened 1902) holds tens of thousands of pharaonic artifacts. In Fustat, the **National Museum of Egyptian Civilization** displays the Royal Mummies in a dedicated hall.");
  E("cairo", ["القاهره", "cairo", "القلعه", "citadel", "خان الخليلي", "khan el khalili", "الازهر", "azhar", "المعز", "muizz", "القاهره الفاطميه", "islamic cairo", "القبطيه", "coptic", "المعلقه", "hanging church", "برج القاهره", "cairo tower", "زمالك"],
    "**القاهرة**: قلعة صلاح الدين (القرن الـ12) ومسجد محمد علي، سوق **خان الخليلي**، جامع الأزهر (970م)، **شارع المعز** بآثاره الإسلامية، **القاهرة القبطية** وكنيسة المعلقة، وبرج القاهرة. للخروج: كافيهات الزمالك وكورنيش النيل ومراكب العشاء. ورشة تصوير في شارع المعز كمان!",
    "**Cairo**: Saladin's Citadel (12th c.) with the Muhammad Ali Mosque, **Khan El-Khalili** bazaar, Al-Azhar Mosque (970 CE), **Al-Muizz Street** with its Islamic monuments, **Coptic Cairo** with the Hanging Church, and Cairo Tower. For hangouts: Zamalek cafes, the Nile Corniche and dinner cruises. There's a photography workshop on Al-Muizz Street too!",
    [["governorates.html?name=Cairo", "صفحة القاهرة", "Cairo page"]], 1.1);
  E("saqqara", ["سقاره", "saqqara", "دهشور", "dahshur", "منف", "memphis", "زوسر", "djoser", "step pyramid", "الهرم المدرج", "المنحنيه", "bent pyramid", "red pyramid", "الهرم الاحمر"],
    "**سقارة**: هرم زوسر المدرج (حوالي 2650 ق.م) أقدم مبنى حجري ضخم، صممه المهندس إمحتب. **دهشور**: الهرم المنحني والهرم الأحمر. **منف**: متحف مفتوح فيه تمثال رمسيس الثاني. المنطقة دي ممكن تتزار في نص يوم من الجيزة.",
    "**Saqqara**: Djoser's Step Pyramid (c. 2650 BCE), the oldest large stone building, designed by Imhotep. **Dahshur**: the Bent and Red Pyramids. **Memphis**: an open-air museum with a Ramses II colossus. Easily visited in half a day from Giza.");
  E("luxor", ["الاقصر", "luxor", "الكرنك", "karnak", "معبد الاقصر", "luxor temple", "وادي الملوك", "valley of the kings", "حتشبسوت", "hatshepsut", "ممنون", "colossi", "طيبه", "thebes", "الضفه الغربيه", "west bank", "وادي الملكات"],
    "**الأقصر** أكبر متحف مفتوح في العالم:\n• **معبد الكرنك**: أكبر مجمع ديني قديم، بقاعة الأعمدة الشهيرة\n• **معبد الأقصر**: جميل جداً بالليل\n• **وادي الملوك**: مقابر ملوك الدولة الحديثة (منها مقبرة توت عنخ آمون)\n• **معبد حتشبسوت** بالدير البحري وتمثالا ممنون\nالأفضل 2-3 أيام. باقة Luxor Temples Tour من 10,000 جنيه، وتذكرة الأقصر الأساسية 450 جنيه للمصريين.",
    "**Luxor** is the world's greatest open-air museum:\n• **Karnak Temple**: the largest ancient religious complex, with its famous Hypostyle Hall\n• **Luxor Temple**: stunning at night\n• **Valley of the Kings**: New Kingdom royal tombs (incl. Tutankhamun's)\n• **Hatshepsut Temple** at Deir el-Bahari and the Colossi of Memnon\nPlan 2-3 days. Luxor Temples Tour package from 10,000 EGP; base ticket 450 EGP for Egyptians.",
    [["book-ticket.html", "احجز", "Book"], ["governorates.html?name=Luxor", "صفحة الأقصر", "Luxor page"]], 1.1);
  E("aswan", ["اسوان", "aswan", "فيله", "philae", "النوبه", "nubia", "nubian", "السد العالي", "high dam", "كوم امبو", "kom ombo", "ادفو", "edfu", "فلوكه", "felucca", "الفنتين", "elephantine", "المسله الناقصه", "unfinished obelisk", "غرب سهيل"],
    "**أسوان**: **معبد فيلة** (للإلهة إيزيس، منقول لجزيرة أجيليكيا)، المسلة الناقصة، السد العالي، جزيرة الفنتين، والقرى النوبية الملونة وركوب **الفلوكة** على النيل. في الطريق للشمال: معبد **كوم أمبو** (سوبك وحورس) ومعبد **إدفو** (الأفضل حفظاً). باقة Aswan Nubian Experience من 9,000 جنيه.",
    "**Aswan**: **Philae Temple** (for the goddess Isis, relocated to Agilkia Island), the Unfinished Obelisk, the High Dam, Elephantine Island, colorful Nubian villages and **felucca** rides on the Nile. Heading north: **Kom Ombo** (Sobek and Horus) and **Edfu** (the best-preserved temple). Aswan Nubian Experience package from 9,000 EGP.",
    [["governorates.html?name=Aswan", "صفحة أسوان", "Aswan page"]], 1.1);
  E("abusimbel", ["ابو سمبل", "abu simbel", "رمسيس الثاني", "ramses", "ramesses", "نفرتاري"],
    "**أبو سمبل** معبدان ضخمان بناهم **رمسيس الثاني** (ونفرتاري) في النوبة جنوب أسوان بحوالي 280 كم، ونُقلا بالكامل في الستينات لإنقاذهما من بحيرة السد العالي. مرتين في السنة (حوالي 22 فبراير و22 أكتوبر) الشمس بتضيء قدس الأقداس. بيتزار عادة برحلة بالعربية أو الطيران من أسوان.",
    "**Abu Simbel** has two colossal temples built by **Ramses II** (and Nefertari) in Nubia, roughly 280 km south of Aswan. They were moved entirely in the 1960s to save them from Lake Nasser. Twice a year (around Feb 22 and Oct 22) the sun lights the inner sanctuary. Usually visited by road convoy or flight from Aswan.");
  E("nile", ["نيل كروز", "كروز", "cruise", "nile cruise", "مركب", "dahabiya", "ذهبيه", "رحله نيليه", "نيلي"],
    "**الكروز النيلي** عادة بين الأقصر وأسوان (3-7 ليالي) مع توقفات في إدفو وكوم أمبو ومعابد على الطريق. باقة Royal Nile Cruise من 15,000 جنيه، وفي بديل أهدى: الدهبيات والفلايك.",
    "A **Nile cruise** typically runs between Luxor and Aswan (3-7 nights) with stops at Edfu, Kom Ombo and other temples. Our Royal Nile Cruise package starts at 15,000 EGP; quieter alternatives are dahabiyas and feluccas.",
    [["all-packages.html", "الباقات", "Packages"]]);
  E("alex", ["الاسكندريه", "اسكندريه", "alexandria", "المكتبه الاسكندريه", "bibliotheca", "قايتباي", "qaitbay", "المنتزه", "montaza", "عمود السواري", "pompey", "كوم الشقافه", "كورنيش الاسكندريه", "سيدي بشر"],
    "**الإسكندرية** أسسها الإسكندر الأكبر (331 ق.م): **مكتبة الإسكندرية**، **قلعة قايتباي** (القرن الـ15 على موقع فنار الإسكندرية القديم)، عمود السواري، كتاكومب كوم الشقافة، حدائق المنتزه، والكورنيش وأكل السمك. باقة Alexandria Coastal Tour من 5,000 جنيه، وفي ورشة تصوير ساحلية على الكورنيش.",
    "**Alexandria**, founded by Alexander the Great (331 BCE): **Bibliotheca Alexandrina**, **Qaitbay Citadel** (15th c., on the site of the ancient Pharos lighthouse), Pompey's Pillar, the Catacombs of Kom el-Shoqafa, Montaza Gardens, plus the Corniche and fresh seafood. Alexandria Coastal Tour from 5,000 EGP, and a coastal photography workshop on the Corniche.",
    [["governorates.html?name=Alexandria", "صفحة الإسكندرية", "Alexandria page"]], 1.1);
  E("redsea", ["الغردقه", "hurghada", "مرسي علم", "marsa alam", "البحر الاحمر", "red sea", "غطس", "diving", "snorkel", "سنوركل", "شعاب", "coral", "reef", "الجونه", "el gouna", "سفاجا", "شاطئ", "beach", "beaches"],
    "**البحر الأحمر**: الغردقة والجونة للشواطئ والغطس، ومرسي علم لرؤية السلاحف وأبقار البحر، وشعاب مرجانية من أجمل في العالم. شغّال طول السنة. باقة Red Sea Paradise من 7,000 جنيه وورشة تصوير تحت الماء في مارينا الغردقة.",
    "**Red Sea**: Hurghada and El Gouna for beaches and diving, Marsa Alam for turtles and dugongs, and some of the world's best coral reefs. Great year-round. Red Sea Paradise package from 7,000 EGP and an underwater photography workshop at Hurghada Marina.",
    [["governorates.html?name=Red%20Sea", "صفحة البحر الأحمر", "Red Sea page"]], 1.1);
  E("sinai", ["سيناء", "sinai", "شرم", "sharm", "دهب", "dahab", "سانت كاترين", "st catherine", "saint catherine", "جبل موسي", "mount sinai", "نويبع", "نبق", "راس محمد", "ras mohammed", "blue hole", "الهول الازرق"],
    "**سيناء**: **جبل موسى** وشروق الشمس من فوقه، **دير سانت كاترين** (القرن السادس، تراث عالمي لليونسكو)، شرم الشيخ ومحمية **رأس محمد** للغطس، ودهب والـ Blue Hole. باقة Sinai Mountain Adventure من 12,000 جنيه.",
    "**Sinai**: **Mount Sinai** with its sunrise hike, **St. Catherine's Monastery** (6th c., UNESCO World Heritage), Sharm El-Sheikh and **Ras Mohammed** National Park for diving, plus Dahab and the Blue Hole. Sinai Mountain Adventure package from 12,000 EGP.",
    [["governorates.html?name=South%20Sinai", "جنوب سيناء", "South Sinai"]], 1.1);
  E("desert", ["سيوه", "siwa", "الصحراء", "صحراء", "desert", "الصحراء البيضاء", "white desert", "الواحات", "oasis", "oases", "بهريه", "bahariya", "فرافره", "farafra", "الوادي الجديد", "new valley", "سفاري", "safari", "الخارجه", "الداخله"],
    "**الصحراء والواحات**: **سيوة** (معبد وحي آمون الذي زاره الإسكندر، قلعة شالي، البحيرات المالحة وعين كليوباترا)، **الصحراء البيضاء** بتكويناتها الطباشيرية قرب الفرافرة، والبحرية والواحات في الوادي الجديد. مناسبة لسفاري وتخييم ونجوم.",
    "**Deserts & oases**: **Siwa** (Temple of the Oracle of Amun visited by Alexander, Shali Fortress, salt lakes and Cleopatra's Spring), the **White Desert** with its chalk formations near Farafra, and Bahariya and the New Valley oases. Perfect for safaris, camping and stargazing.");
  E("fayoum", ["الفيوم", "fayoum", "faiyum", "وادي الريان", "wadi el rayan", "قارون", "qarun", "تونس", "tunis village", "وادي الحيتان", "wadi al hitan", "whale valley", "شلالات"],
    "**الفيوم**: بحيرة قارون وشلالات **وادي الريان**، **وادي الحيتان** (تراث عالمي لليونسكو بهياكل حيتان متحجرة) وقرية تونس للفخار. قريبة من القاهرة (حوالي ساعتين). باقة Fayoum Oasis Escape من 6,000 جنيه.",
    "**Fayoum**: Lake Qarun, the **Wadi El Rayan** waterfalls, **Wadi Al-Hitan** (UNESCO site with fossil whale skeletons) and Tunis village pottery. About 2 hours from Cairo. Fayoum Oasis Escape from 6,000 EGP.",
    [["governorates.html?name=Faiyum", "صفحة الفيوم", "Fayoum page"]], 1.1);
  E("upper", ["دندره", "dendera", "ابيدوس", "abydos", "المنيا", "minya", "العمارنه", "amarna", "اخناتون", "akhenaten", "بني حسن", "beni hasan", "تونا الجبل", "tuna el gebel", "سوهاج", "sohag", "قنا", "qena", "اسيوط", "assiut"],
    "**صعيد مصر خارج المعتاد**: معبد **دندرة** (حتحور) في قنا، معبد **سيتي الأول** في أبيدوس بسوهاج، ومحافظة **المنيا** بمقابر بني حسن وتل العمارنة (عاصمة إخناتون) وتونا الجبل. وجهات هادية وأسعارها أقل (تذكرة المنيا 320 جنيه).",
    "**Off-the-beaten-path Upper Egypt**: the **Dendera** temple of Hathor (Qena), Seti I's temple at **Abydos** (Sohag), and **Minya** with the Beni Hasan tombs, Tell el-Amarna (Akhenaten's capital) and Tuna el-Gebel. Quieter and cheaper (Minya ticket 320 EGP).");
  E("history", ["هيروغليفي", "هيروغليفيه", "hieroglyph", "hieroglyphs", "فراعنه", "فرعون", "pharaoh", "pharaohs", "تاريخ", "history", "حضاره", "civilization", "كليوباترا", "cleopatra", "مومياء", "mummy", "حجر رشيد", "rosetta"],
    "الحضارة المصرية القديمة استمرت أكثر من 3,000 سنة، من توحيد القطرين حوالي 3100 ق.م. عصر بناة الأهرامات (الدولة القديمة)، ثم الدولة الوسطى والحديثة (الأقصر وطيبة). الكتابة الهيروغليفية تم فك رموزها بفضل **حجر رشيد**. وكليوباترا السابعة آخر ملكات البطالمة.",
    "Ancient Egyptian civilization lasted 3,000+ years, starting with the unification around 3100 BCE. The pyramid builders belong to the Old Kingdom, followed by the Middle and New Kingdoms (Thebes/Luxor). Hieroglyphs were deciphered thanks to the **Rosetta Stone**, and Cleopatra VII was the last Ptolemaic queen.");
  E("season", ["افضل وقت", "امتي اسافر", "best time", "when to visit", "طقس", "weather", "صيف", "شتاء", "حر", "heat", "موسم", "season", "درجه الحراره"],
    "أفضل وقت لزيارة مصر من **أكتوبر لأبريل** (الجو معتدل). الصيف حر جداً في الأقصر وأسوان (فوق 40°)، فاعمل الزيارات الأثرية الصبح بدري. البحر الأحمر والساحل الشمالي مناسبين طول السنة تقريباً. ولو الحر مضايقك: جرّب تجربة الـ VR.",
    "The best time to visit Egypt is **October to April** (mild weather). Summers are very hot in Luxor and Aswan (40°C+), so visit sites early in the morning. The Red Sea and North Coast work almost year-round. If heat bothers you, try our VR experience.",
    [["vr.html", "الـ VR", "VR"]]);
  E("tips", ["نصايح", "نصيحه", "tips", "advice", "ملابس", "dress", "اداب", "etiquette", "امان", "امن", "safe", "safety", "فلوس", "عمله", "currency", "جنيه", "egp", "بقشيش", "tipping", "baksheesh", "لغه", "language", "ماء", "مياه"],
    "نصايح سريعة:\n• العملة: الجنيه المصري (EGP)، والبقشيش عادة معتادة\n• الملابس: محتشمة في المساجد والكنائس، وخفيفة مع قبعة وواقي شمس للآثار\n• اشرب مياه كتير واحمل زجاجة معاك\n• استخدم مرشدين مرخصين وحجز رسمي\n• القواعد الخاصة بالتصوير (كاميرا/ترايبود) بتختلف من موقع لموقع، اسأل عند المدخل\n• اتفاوض على الأسعار في الأسواق بابتسامة 😊",
    "Quick tips:\n• Currency: Egyptian pound (EGP); tipping (baksheesh) is customary\n• Dress modestly in mosques and churches, light clothes with a hat and sunscreen at ancient sites\n• Drink plenty of water and carry a bottle\n• Use licensed guides and official bookings\n• Photography rules (camera/tripod) vary by site, so ask at the entrance\n• Bargain in bazaars, with a smile 😊");
  E("transport", ["مواصلات", "transport", "قطر", "قطار", "train", "طيران", "flight", "flights", "مطار", "airport", "مترو", "metro", "اوبر", "uber", "تاشيره", "visa", "سفر", "تنقل"],
    "التنقل: قطارات بين القاهرة والإسكندرية والأقصر وأسوان (فيه قطار نوم للصعيد)، ورحلات طيران داخلية للأقصر وأسوان والغردقة وشرم، ومترو القاهرة وتطبيقات التاكسي داخل المدن. بالنسبة للتأشيرة، اتأكد من بوابة التأشيرة الإلكترونية الرسمية أو سفارة مصر في بلدك لأن الشروط بتتغير.",
    "Getting around: trains link Cairo with Alexandria, Luxor and Aswan (including a sleeper train to Upper Egypt), domestic flights serve Luxor, Aswan, Hurghada and Sharm, and Cairo has a metro plus ride-hailing apps. For visas, check Egypt's official e-visa portal or your local embassy since rules change.");
  E("food", ["اكل", "اكله", "طعام", "food", "eat", "مطعم", "restaurant", "كشري", "koshari", "فول", "طعميه", "falafel", "ملوخيه", "molokhia", "حمام محشي", "فطير", "shawarma", "dish", "cuisine"],
    "لازم تجرب: **الكشري** (أكلة مصر الشعبية)، الفول والطعمية، الملوخية، الحمام المحشي، الفطير المشلتت، وسمك الإسكندرية. وللحلو: أم علي وكنافة.",
    "Must-try: **koshari** (Egypt's national street food), ful and ta'amiya, molokhia, stuffed pigeon, fiteer meshaltet, and Alexandria seafood. For dessert: Om Ali and kunafa.");
  E("itinerary", ["خطه", "خطة", "جدول", "itinerary", "plan my", "plan a trip", "اسبوع", "week", "ايام", "days", "اقترح", "suggest", "recommend", "ارشح", "ترشيح", "trip plan", "plan", "trip", "7 day", "خطط لي", "رحله 7"],
    "اقتراح رحلة **7 أيام**:\n1-2) القاهرة والجيزة: الأهرامات، المتحف المصري الكبير، خان الخليلي\n3) سقارة ودهشور (أو الإسكندرية)\n4-5) الأقصر: الكرنك، وادي الملوك، حتشبسوت\n6) أسوان: فيلة والنوبة (وأبو سمبل لو تحب)\n7) رجوع أو يوم استرخاء في الغردقة\nقولّي ميزانيتك ومدة رحلتك وأنا أعدّلها.",
    "A suggested **7-day** trip:\n1-2) Cairo & Giza: Pyramids, Grand Egyptian Museum, Khan El-Khalili\n3) Saqqara and Dahshur (or Alexandria)\n4-5) Luxor: Karnak, Valley of the Kings, Hatshepsut\n6) Aswan: Philae and Nubia (plus Abu Simbel if you like)\n7) Fly home or relax in Hurghada\nTell me your budget and trip length and I'll adjust it.",
    [["all-packages.html", "الباقات", "Packages"]]);

  /* Arabic names for the governorates in data.json */
  var GOV_AR = { "Cairo": "القاهرة", "Giza": "الجيزة", "Alexandria": "الإسكندرية", "Dakahlia": "الدقهلية", "Sharqia": "الشرقية", "Gharbia": "الغربية", "Beheira": "البحيرة", "Qalyubia": "القليوبية", "Kafr El Sheikh": "كفر الشيخ", "Monufia": "المنوفية", "Damietta": "دمياط", "Port Said": "بورسعيد", "Suez": "السويس", "Ismailia": "الإسماعيلية", "Red Sea": "البحر الأحمر", "Matrouh": "مطروح", "Aswan": "أسوان", "Luxor": "الأقصر", "Qena": "قنا", "Minya": "المنيا", "Beni Suef": "بني سويف", "Faiyum": "الفيوم", "Assiut": "أسيوط", "Sohag": "سوهاج", "New Valley (Al Wadi Al Gedid)": "الوادي الجديد", "North Sinai": "شمال سيناء", "South Sinai": "جنوب سيناء" };

  var PAGES = {
    "index.html": ["الصفحة الرئيسية للموقع", "the home page"], "company.html": ["صفحة الشركة والباقات السياحية", "the company and packages page"],
    "all-packages.html": ["صفحة كل الباقات", "the all-packages page"], "book-ticket.html": ["صفحة حجز التذاكر", "the ticket booking page"],
    "disabilty.html": ["صفحة دعم ذوي الاحتياجات الخاصة", "the accessibility support page"], "volunteers.html": ["صفحة التطوع", "the volunteer page"],
    "workshop.html": ["صفحة ورش التصوير", "the photography workshops page"], "vr.html": ["صفحة الواقع الافتراضي", "the VR page"],
    "library.html": ["صفحة المكتبة", "the library page"], "about_us.html": ["صفحة من نحن", "the about page"], "team.html": ["صفحة الفريق", "the team page"],
    "contact.html": ["صفحة التواصل", "the contact page"], "login.html": ["صفحة تسجيل الدخول", "the login page"], "signup.html": ["صفحة إنشاء حساب", "the sign-up page"],
    "project.html": ["صفحة الخريطة التفاعلية", "the interactive map page"], "governorates.html": ["صفحة تفاصيل المحافظة", "the governorate details page"]
  };
  var curFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (curFile === "") curFile = "index.html";

  /* ---------- retrieval ---------- */
  function matchScore(q, padded, e) {
    var s = 0;
    for (var i = 0; i < e.kw.length; i++) {
      var k = e.kw[i]; if (!k) continue;
      var hit = k.length <= 3 ? padded.indexOf(" " + k + " ") > -1 : q.indexOf(k) > -1;
      if (hit) s += k.length + 2;
    }
    return s * e.w;
  }
  function retrieve(text, n) {
    var q = norm(text), padded = " " + q + " ", r = [];
    for (var i = 0; i < KB.length; i++) { var sc = matchScore(q, padded, KB[i]); if (sc > 0) r.push({ e: KB[i], s: sc }); }
    r.sort(function (a, b) { return b.s - a.s; });
    return r.slice(0, n || 3);
  }

  var T = {
    ar: {
      title: "مرشد ExoToura", sub: "مساعدك الذكي لاستكشاف مصر", ph: "اسأل عن مصر أو الموقع...", send: "إرسال", open: "افتح المحادثة", close: "إغلاق", clear: "مسح المحادثة",
      tip: "اسألني عن مصر 👋", more: "كمان:", typing: "بكتب...",
      hello: "أهلاً بيك في **ExoToura**! 👋\nأنا مرشدك الذكي، اسألني عن الأماكن الأثرية والسياحة في مصر، المحافظات، الحجز والباقات، الـ VR، الورش أو أي صفحة في الموقع.",
      none: "مش متأكد إني فهمت سؤالك 🤔 جرّب تسألني عن: الأهرامات، الأقصر، أسوان، الحجز، الباقات، الـ VR، التطوع، أو ورش التصوير.",
      here: "إنت دلوقتي في ",
      chips: ["إيه هو الموقع ده؟", "أشهر الأماكن الأثرية", "إزاي أحجز تذكرة؟", "الباقات والأسعار", "خدمات ذوي الاحتياجات", "اقترح لي رحلة 7 أيام"]
    },
    en: {
      title: "ExoToura Guide", sub: "Your smart guide to Egypt", ph: "Ask about Egypt or the site...", send: "Send", open: "Open chat", close: "Close", clear: "Clear chat",
      tip: "Ask me about Egypt 👋", more: "Related:", typing: "typing...",
      hello: "Welcome to **ExoToura**! 👋\nI'm your smart guide. Ask me about archaeological sites and tourism in Egypt, governorates, booking and packages, VR, workshops, or any page on the site.",
      none: "I'm not sure I got that 🤔 Try asking about: the Pyramids, Luxor, Aswan, booking, packages, VR, volunteering, or photography workshops.",
      here: "You're currently on ",
      chips: ["What is this site?", "Top archaeological sites", "How do I book a ticket?", "Packages & prices", "Accessibility services", "Plan a 7-day trip"]
    }
  };
  var ui = (document.documentElement.lang === "ar" || (navigator.language || "").indexOf("ar") === 0) ? "ar" : "en";

  function pageLine(lang) {
    var p = PAGES[curFile]; if (!p) return "";
    return "\n\n" + T[lang].here + (lang === "ar" ? p[0] : p[1]) + ".";
  }

  function localAnswer(text) {
    var lang = isAr(text) ? "ar" : "en";
    var q = norm(text);
    if (/(انا فين|اي صفحه دي|الصفحه دي|this page|where am i|current page)/.test(q)) {
      var p = PAGES[curFile]; var t = T[lang];
      return { text: p ? t.here + (lang === "ar" ? p[0] : p[1]) + "." : t.none, links: [] , lang: lang};
    }
    var r = retrieve(text, 2);
    if (!r.length) return { text: T[lang].none, links: [], lang: lang };
    var top = r[0].e, out = top[lang];
    if (r[1] && r[1].s >= r[0].s * 0.85 && r[1].e.id !== top.id && out.length < 700) out += "\n\n" + r[1].e[lang];
    var links = top.links.slice();
    if (r[1] && r[1].s >= r[0].s * 0.85) links = links.concat(r[1].e.links);
    return { text: out, links: links.slice(0, 3), lang: lang };
  }

  /* governorates from data.json (adds detail for all 27) */
  function loadGovs() {
    fetch(BASE + "data.json").then(function (r) { return r.json(); }).then(function (d) {
      (d.governorates || []).forEach(function (g) {
        var ar = GOV_AR[g.name] || g.name, name = g.name.replace(/\s*\(.*\)/, "");
        var enList = (g.attractions || []).join("; "), hang = (g.hangouts || []).join("; ");
        var link = [["governorates.html?name=" + encodeURIComponent(g.name), "صفحة " + ar, name + " page"]];
        E("gov-" + name, [name, ar, name + " governorate", "محافظه " + ar], 
          "**" + ar + "**: " + (g.shortInfo || "") + "\nأهم الأماكن: " + enList + "\nأماكن للخروج: " + hang,
          "**" + name + "**: " + (g.description || g.shortInfo || "") + "\nMain attractions: " + enList + "\nPopular hangouts: " + hang, link, 0.7);
      });
    }).catch(function () { });
  }

  /* ---------- optional AI backend ---------- */
  var aiState = null, history = [];
  try { history = JSON.parse(sessionStorage.getItem("exoChat") || "[]"); } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem("exoChat", JSON.stringify(history.slice(-30))); } catch (e) { } }

  var OVERVIEW = "ExoToura is an Egyptian tourism website with: ticket booking and packages (Company, All packages, Book ticket), VR tours (paid), disability support with vetted volunteers, photography workshops in Egyptian governorates, volunteer program, interactive map of 27 governorates, a library, about/team/contact pages. Team: Adam Wessam, Moaz Ahmed, Malek Ahmed, Mohamed Kamal, Yossef.";
  function askAI(text, lang) {
    if (aiState === false) return Promise.resolve(null);
    var ctx = retrieve(text, 3).map(function (x) { return x.e.en; }).join("\n---\n");
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    return fetch(API, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({ messages: history.slice(-10).map(function (m) { return { role: m.role, content: m.text }; }), context: OVERVIEW + "\n---\n" + ctx, page: curFile, lang: lang })
    }).then(function (r) {
      clearTimeout(to);
      if (r.status === 404 || r.status === 405 || r.status === 503) { aiState = false; return null; }
      if (!r.ok) return null;
      return r.json().then(function (j) { if (j && j.reply) { aiState = true; return j.reply; } return null; });
    }).catch(function () { clearTimeout(to); return null; });
  }

  /* ---------- UI ---------- */
  var CSS = ".exo-btn{position:fixed;right:20px;bottom:20px;width:62px;height:62px;border-radius:50%;border:0;cursor:pointer;z-index:10000;background:linear-gradient(135deg,#f3d36b,#D4AF37 60%,#b8921f);box-shadow:0 8px 24px rgba(0,33,71,.35);display:flex;align-items:center;justify-content:center;transition:transform .25s}.exo-btn:hover{transform:scale(1.08)}.exo-btn:focus-visible{outline:3px solid #002147;outline-offset:3px}.exo-btn svg{width:30px;height:30px;fill:#002147}.exo-btn::after{content:'';position:absolute;inset:0;border-radius:50%;border:2px solid #D4AF37;animation:exoPulse 2.2s infinite;pointer-events:none}@keyframes exoPulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.55);opacity:0}}.exo-tip{position:fixed;right:92px;bottom:34px;background:#fff;color:#002147;padding:9px 14px;border-radius:14px;font:600 14px/1.3 Lato,Segoe UI,Tahoma,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.18);z-index:10000;max-width:210px;animation:exoIn .4s}.exo-panel{position:fixed;right:20px;bottom:96px;width:380px;max-width:calc(100vw - 24px);height:min(600px,calc(100vh - 120px));background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.3);display:none;flex-direction:column;overflow:hidden;z-index:10001;font-family:Lato,'Segoe UI',Tahoma,sans-serif;animation:exoIn .25s}.exo-panel.open{display:flex}@keyframes exoIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.exo-head{background:linear-gradient(135deg,#002147,#0a3a73);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px}.exo-av{width:40px;height:40px;border-radius:50%;background:#D4AF37;color:#002147;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none}.exo-ht{flex:1;min-width:0}.exo-ht b{display:block;font-size:16px;color:#D4AF37}.exo-ht span{font-size:12px;opacity:.85}.exo-ib{background:rgba(255,255,255,.12);border:0;color:#fff;border-radius:8px;min-width:32px;height:32px;cursor:pointer;font-size:14px;padding:0 8px}.exo-ib:hover{background:rgba(255,255,255,.25)}.exo-msgs{flex:1;overflow-y:auto;padding:14px;background:#f5f3ec;display:flex;flex-direction:column;gap:10px}.exo-m{max-width:86%;padding:10px 13px;border-radius:16px;font-size:14.5px;line-height:1.6;word-wrap:break-word;white-space:pre-wrap;animation:exoIn .2s}.exo-m.bot{background:#fff;color:#1a1a1a;align-self:flex-start;border:1px solid #e6e0cc;border-bottom-left-radius:4px}.exo-m.user{background:#002147;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}.exo-m a{color:#0a58ca;text-decoration:underline}.exo-m.user a{color:#f3d36b}.exo-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.exo-links a{background:#fff7da;border:1px solid #D4AF37;color:#002147;text-decoration:none;padding:4px 10px;border-radius:14px;font-size:13px;font-weight:700}.exo-links a:hover{background:#D4AF37}.exo-chips{display:flex;gap:8px;padding:8px 12px;overflow-x:auto;background:#f5f3ec;border-top:1px solid #e6e0cc;scrollbar-width:thin}.exo-chips button{flex:none;background:#fff;border:1px solid #D4AF37;color:#002147;border-radius:16px;padding:6px 12px;font-size:13px;cursor:pointer;font-family:inherit}.exo-chips button:hover{background:#D4AF37}.exo-form{display:flex;gap:8px;padding:10px 12px;background:#fff;border-top:1px solid #e6e0cc}.exo-form input{flex:1;border:1px solid #cfc8b0;border-radius:22px;padding:10px 14px;font-size:14.5px;outline:none;font-family:inherit;min-width:0}.exo-form input:focus{border-color:#D4AF37;box-shadow:0 0 0 3px rgba(212,175,55,.25)}.exo-form button{background:#D4AF37;color:#002147;border:0;border-radius:50%;width:42px;height:42px;cursor:pointer;font-size:18px;font-weight:700;flex:none}.exo-form button:hover{background:#c29f2c}.exo-dots{display:inline-flex;gap:4px}.exo-dots i{width:7px;height:7px;border-radius:50%;background:#999;animation:exoDot 1.2s infinite}.exo-dots i:nth-child(2){animation-delay:.2s}.exo-dots i:nth-child(3){animation-delay:.4s}@keyframes exoDot{0%,60%,100%{opacity:.3}30%{opacity:1}}.exo-panel[dir=rtl] .exo-m.bot{border-bottom-left-radius:16px;border-bottom-right-radius:4px}.exo-panel[dir=rtl] .exo-m.user{border-bottom-right-radius:16px;border-bottom-left-radius:4px}@media(max-width:520px){.exo-panel{right:8px;left:8px;bottom:88px;width:auto;max-width:none;height:calc(100vh - 110px);border-radius:16px}.exo-btn{right:14px;bottom:14px}.exo-tip{right:84px}}@media(prefers-reduced-motion:reduce){.exo-btn::after,.exo-m,.exo-panel{animation:none}}";

  var el = {}, busy = false;
  function fmt(t) {
    var h = esc(t);
    h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|[\w.-]+\.html)[^)\s]*)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return h;
  }
  function addMsg(role, text, links) {
    var d = document.createElement("div"); d.className = "exo-m " + role; d.setAttribute("dir", "auto");
    d.innerHTML = fmt(text);
    if (links && links.length) {
      var w = document.createElement("div"); w.className = "exo-links";
      links.forEach(function (l) { var a = document.createElement("a"); a.href = BASE + l[0]; a.textContent = "🔗 " + (ui === "ar" ? l[1] : l[2]); w.appendChild(a); });
      d.appendChild(w);
    }
    el.msgs.appendChild(d); el.msgs.scrollTop = el.msgs.scrollHeight; return d;
  }
  function setChips() {
    el.chips.innerHTML = "";
    T[ui].chips.forEach(function (c) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = c;
      b.onclick = function () { send(c); }; el.chips.appendChild(b);
    });
  }
  function applyLang() {
    var t = T[ui];
    el.panel.setAttribute("dir", ui === "ar" ? "rtl" : "ltr");
    el.title.textContent = t.title; el.sub.textContent = t.sub; el.input.placeholder = t.ph;
    el.btn.setAttribute("aria-label", t.open); el.close.setAttribute("aria-label", t.close); el.clear.setAttribute("aria-label", t.clear); el.clear.title = t.clear;
    el.sendBtn.setAttribute("aria-label", t.send); el.lang.textContent = ui === "ar" ? "EN" : "ع";
    setChips();
  }
  function render() {
    el.msgs.innerHTML = "";
    if (!history.length) addMsg("bot", T[ui].hello + pageLine(ui));
    history.forEach(function (m) { addMsg(m.role === "user" ? "user" : "bot", m.text, m.links); });
  }
  function send(text) {
    text = (text || "").trim(); if (!text || busy) return;
    busy = true; el.input.value = "";
    if (isAr(text)) { if (ui !== "ar") { ui = "ar"; applyLang(); } } else if (/[a-z]{3,}/i.test(text) && ui !== "en") { ui = "en"; applyLang(); }
    history.push({ role: "user", text: text }); addMsg("user", text);
    var ty = addMsg("bot", ""); ty.innerHTML = '<span class="exo-dots"><i></i><i></i><i></i></span>';
    var lang = isAr(text) ? "ar" : "en";
    askAI(text, lang).then(function (reply) {
      var res;
      if (reply) res = { text: reply, links: [] };
      else res = localAnswer(text);
      return new Promise(function (ok) { setTimeout(function () { ok(res); }, reply ? 0 : 450); });
    }).then(function (res) {
      ty.remove(); history.push({ role: "assistant", text: res.text, links: res.links }); addMsg("bot", res.text, res.links); save();
    }).catch(function () {
      ty.remove(); addMsg("bot", T[ui].none);
    }).then(function () { busy = false; });
  }
  function toggle(open) {
    var o = typeof open === "boolean" ? open : !el.panel.classList.contains("open");
    el.panel.classList.toggle("open", o); el.btn.setAttribute("aria-expanded", String(o));
    if (el.tip) { el.tip.remove(); el.tip = null; }
    try { sessionStorage.setItem("exoTip", "1"); } catch (e) { }
    if (o) setTimeout(function () { el.input.focus(); }, 60); else el.btn.focus();
  }
  function build() {
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    var root = document.createElement("div"); root.id = "exo-chat";
    root.innerHTML =
      '<button class="exo-btn" type="button" aria-haspopup="dialog" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6 2 11c0 2.6 1.2 4.9 3.1 6.5L4 22l4.6-2.2c1.1.3 2.2.4 3.4.4 5.5 0 10-4 10-9s-4.5-9-10-9zm-4 10a1.3 1.3 0 110-2.6A1.3 1.3 0 018 12zm4 0a1.3 1.3 0 110-2.6 1.3 1.3 0 010 2.6zm4 0a1.3 1.3 0 110-2.6 1.3 1.3 0 010 2.6z"/></svg></button>' +
      '<section class="exo-panel" role="dialog" aria-label="ExoToura Guide"><div class="exo-head"><div class="exo-av" aria-hidden="true">🏺</div><div class="exo-ht"><b></b><span></span></div>' +
      '<button class="exo-ib exo-lang" type="button">EN</button><button class="exo-ib exo-clear" type="button">↺</button><button class="exo-ib exo-close" type="button">✕</button></div>' +
      '<div class="exo-msgs" aria-live="polite"></div><div class="exo-chips"></div>' +
      '<form class="exo-form" autocomplete="off"><input type="text" maxlength="500"><button type="submit">➤</button></form></section>';
    document.body.appendChild(root);
    el.btn = root.querySelector(".exo-btn"); el.panel = root.querySelector(".exo-panel"); el.msgs = root.querySelector(".exo-msgs");
    el.chips = root.querySelector(".exo-chips"); el.input = root.querySelector("input"); el.sendBtn = root.querySelector(".exo-form button");
    el.title = root.querySelector(".exo-ht b"); el.sub = root.querySelector(".exo-ht span");
    el.lang = root.querySelector(".exo-lang"); el.clear = root.querySelector(".exo-clear"); el.close = root.querySelector(".exo-close");
    el.btn.onclick = function () { toggle(); }; el.close.onclick = function () { toggle(false); };
    el.lang.onclick = function () { ui = ui === "ar" ? "en" : "ar"; applyLang(); if (!history.length) render(); };
    el.clear.onclick = function () { history = []; save(); render(); };
    root.querySelector("form").onsubmit = function (e) { e.preventDefault(); send(el.input.value); };
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && el.panel.classList.contains("open")) toggle(false); });
    applyLang(); render();
    var seen = false; try { seen = sessionStorage.getItem("exoTip") === "1"; } catch (e) { }
    if (!seen) setTimeout(function () {
      if (el.panel.classList.contains("open")) return;
      el.tip = document.createElement("div"); el.tip.className = "exo-tip"; el.tip.textContent = T[ui].tip; root.appendChild(el.tip);
      setTimeout(function () { if (el.tip) { el.tip.remove(); el.tip = null; } }, 6000);
    }, 2500);
    loadGovs();
  }

  window.__exoEngine = { norm: norm, localAnswer: localAnswer, retrieve: retrieve, KB: KB };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
