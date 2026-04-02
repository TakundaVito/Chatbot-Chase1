const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();
app.use(bodyParser.json());

// ===============================
// 🔑 CONFIGURATION
// ===============================
const TOKEN = "EAAM57Ve9x3oBQ1Gelwv8j27BjRN8hZCgvxZCAu30dFBV5uOKC2dXKsG4Ij3JZBXsyEiZAyZCNkNWT8CAxZAv8KpUdtKt1LhXCKX8fX4IspUXbPKllVDCiwcaSrVhZCLr5cYoo2r6Vbx5IhmpF6raR8eFNHu5jbuVrZCoG1jrFo7BvRtx1dxedj5k8wwlBK6dLXnKQMpimr1ZB1QzpFyROaYAIAOf8fBf8ymemTAS1pzJGiL3I59YpJtrV3UxbTCjg40VLm1Mto5bHlK6YP0w5xIdQQNpeWQZDZD";
const PHONE_NUMBER_ID = "1047943131730645";
const VERIFY_TOKEN = "chase123";

const agent = new https.Agent({ family: 4 });

// ===============================
// 🤖 BOT MODE & COEXISTENCE
// ===============================
let botMode = true;
let adminNumber = "263775837909";
const SESSION_TIMEOUT = 10 * 60 * 1000;
let userLastActivity = {};
let userMode = {};

// Session cleanup
setInterval(() => {
    const now = Date.now();
    for (const [userId, lastActive] of Object.entries(userLastActivity)) {
        if (now - lastActive > SESSION_TIMEOUT) {
            if (users[userId]) {
                users[userId] = {
                    step: 'welcome',
                    language: 'en',
                    data: {}
                };
                console.log(`🕐 Session timeout for ${userId}, reset to welcome`);
            }
            delete userLastActivity[userId];
        }
    }
}, 60000);

// ===============================
// 📚 DATA
// ===============================
const locations = ["Harare", "Norton", "Chegutu", "Kadoma", "Kwekwe", "Gweru", "Bulawayo"];

// Pickup location details (only pickup info, no delivery)
const pickupDetails = {
    'Harare': {
        location: 'Jameson Hotel along Park Street',
        time: '9:00 – 13:00',
        contact: '+263 77 741 6664',
        whatsapp: 'https://wa.me/263777416664'
    },
    'Norton': {
        location: 'Karina Main Bus Stop',
        time: '14:14 – 14:30',
        contact: '263785168309',
        whatsapp: 'https://wa.me/263785168309'
    },
    'Chegutu': {
        location: 'Engen Garage',
        time: '15:00 – 15:30',
        contact: '263785168309',
        whatsapp: 'https://wa.me/263785168309'
    },
    'Kadoma': {
        location: 'Waverly Bus stop (NEXT TO THE STAGE)',
        time: '16:00 – 16:30',
        contact: '263785168309',
        whatsapp: 'https://wa.me/263785168309'
    },
    'Kwekwe': {
        location: 'Eat n Lick TOTAL GARAGE',
        time: '17:00 – 17:30',
        contact: '0781178955',
        whatsapp: 'https://wa.me/263781178955'
    },
    'Gweru': {
        location: 'TOPSY TIM MALL, Shop 10',
        address: 'Along 6th Street (old CLUB UPTOWN), opposite BETHEL CLINIC',
        time: '18:15',
        contact: '0781178955',
        whatsapp: 'https://wa.me/263781178955'
    },
    'Bulawayo': {
        location: 'MAIN STREET PLAZA, Shop 14',
        address: 'Main Street between 11th & 12th Avenue (Next to N1 HOTEL)',
        time: '18:30 – 19:00',
        contact: '+263 77 501 8137',
        whatsapp: 'https://wa.me/263775018137'
    }
};

// Destination details for tracking
const destinationDetails = {
    'Harare': {
        dropPoint: 'Harare Main Terminal',
        address: 'Robert Mugabe Road, Opposite Harare Gardens',
        contact: 'Agent Tinashe',
        phone: '263785168309',
        whatsapp: 'https://wa.me/263785168309'
    },
    'Norton': {
        dropPoint: 'Karina',
        address: 'Main Bus Stop',
        contact: 'Agent Michael',
        phone: '263785168309',
        whatsapp: 'https://wa.me/263785168309'
    },
    'Chegutu': {
        dropPoint: 'Engen Garage',
        address: 'Along Harare-Bulawayo Road',
        contact: 'Agent Tinashe',
        phone: '263785168309',
        whatsapp: 'https://wa.me/263785168309'
    },
    'Kadoma': {
        dropPoint: 'Waverly Bus stop',
        address: 'NEXT TO THE STAGE',
        contact: 'Agent Tinashe',
        phone: '263785168309',
        whatsapp: 'https://wa.me/263785168309'
    },
    'Kwekwe': {
        dropPoint: 'Eat n Lick TOTAL GARAGE',
        address: 'Main Road',
        contact: 'Agent Tinashe',
        phone: '0781178955',
        whatsapp: 'https://wa.me/263781178955'
    },
    'Gweru': {
        dropPoint: 'TOPSY TIM MALL',
        address: 'Along 6th Street (old CLUB UPTOWN), opposite BETHEL CLINIC, Shop 10',
        contact: 'Gweru Office',
        phone: '0781178955',
        whatsapp: 'https://wa.me/263781178955'
    },
    'Bulawayo': {
        dropPoint: 'MAIN STREET PLAZA',
        address: 'Main Street between 11th & 12th Avenue (Next to N1 HOTEL), Shop 14',
        contact: 'Ask for PAMELA',
        phone: '+263 77 501 8137',
        whatsapp: 'https://wa.me/263775018137',
        collectionHours: 'Mon–Sat 8:30AM–3PM, Sun 9AM–11AM'
    }
};

const agents = {
    'Harare': { name: 'Harare Agent', number: '263785168309', whatsapp: 'https://wa.me/263785168309' },
    'Norton': { name: 'Harare Agent', number: '263785168309', whatsapp: 'https://wa.me/263785168309' },
    'Chegutu': { name: 'Harare Agent', number: '263785168309', whatsapp: 'https://wa.me/263785168309' },
    'Kadoma': { name: 'Harare Agent', number: '263785168309', whatsapp: 'https://wa.me/263785168309' },
    'Kwekwe': { name: 'Gweru Agent', number: '0781178955', whatsapp: 'https://wa.me/263781178955' },
    'Gweru': { name: 'Gweru Agent', number: '0781178955', whatsapp: 'https://wa.me/263781178955' },
    'Bulawayo': { name: 'Bulawayo Agent', number: '263775018137', whatsapp: 'https://wa.me/263775018137' }
};

const bikePrices = {
    "cbd": "$3", "avenue": "$3", "belvedere": "$5", "milton park": "$5",
    "avondale": "$5", "borrowdale": "$7", "mabvuku": "$10", "hatfield": "$7",
    "chisipiti": "$7", "chisipite": "$7"
};

// ===============================
// 🌐 TRANSLATIONS
// ===============================
const translations = {
    en: {
        welcome: "👋 Hello! I'm chase the transporter. Type 'Hi' to begin.",
        languageSelect: "Select your language:",
        mainMenu: "How can we assist you today?",
        courier: "📦 Courier Service",
        track: "🔍 Track Parcel",
        bike: "🏍️ Bike Delivery",
        taxi: "🚖 Taxi to Gweru",
        price: "💰 Price List",
        location: "📍 Office Locations",
        agent: "👤 Speak to Agent",
        about: "ℹ️ About Us",
        aboutText: "Chase the transporter is a trusted courier service operating along the Harare–Bulawayo route. We offer reliable parcel delivery with daily scheduled runs.",
        priceList: "💰 *Price List*\n\n• Small parcel (<5kg): $5\n• Medium parcel (5-10kg): $10\n• Large parcel (10-20kg): $15\n• Phone/Laptop: $10 flat rate\n• Bike Delivery (Harare only): $3 - $10 depending on zone",
        officeLocations: "📍 *Our Offices*\n\n*BULAWAYO*\nMAIN STREET PLAZA, Shop 14\nAsk for PAMELA\n📞 +263 77 501 8137\n\n*GWERU*\nTOPSY TIM MALL, Shop 10\n📞 0781178955",
        courierPickup: "📍 Where will you be dropping off your parcel?",
        pickupInfo: "📦 *Pickup Location Details*\n\n📍 *Location:* {location}\n🕒 *Time:* {time}\n📞 *Contact:* {contact}\n\nPlease meet our agent at the above location during the specified time.\n\nClick to chat: {whatsapp}",
        trackPrompt: "🔍 Select destination to track your parcel:",
        trackingInfo: "🔍 *Parcel Tracking Information*\n\n📍 *Destination:* {destination}\n🏢 *Drop-off Point:* {dropPoint}\n📮 *Address:* {address}\n📞 *Agent Contact:* {contact}\n📱 Click to chat: {whatsapp}\n\n📅 *Collection Date:* Tomorrow\n🕒 *Collection Time:* From 8:30 AM\n\n⚠️ *Storage Fee:* $2 if not collected within 36 hours",
        bikePrompt: "🏍️ *Bike Delivery (Harare only)*\n\nCollection starts at 9am, cut-off time 1pm.\n\nPlease enter your suburb/area (e.g., Avondale, Borrowdale, CBD):",
        bikePrice: "✅ Delivery to *{area}* costs {price}",
        bikeBooking: "To book, reply with your name and phone number.\nOr type 'agent' to speak to an agent.\nType 'menu' to return.",
        taxiPrompt: "🚖 *Taxi to Gweru*\n\nPrice: $10 per person (excluding luggage).\nHow many people? (1-9)",
        taxiConfirm: "✅ Taxi booked for {people} people. Total: ${total}\n\nAn agent will contact you to confirm.",
        agentSelect: "Select your location:",
        agentContact: "👤 *{name}*\n📞 {number}\n\n📱 Click to chat: {whatsapp}",
        backToMenu: "🏠 Returning to main menu...",
        operationCancelled: "❌ Operation cancelled. Returning to main menu.",
        invalidSelection: "❌ Please select a valid option.",
        confirm: "✅ Continue",
        change: "✏️ Change",
        cancel: "❌ Cancel",
        continue: "📦 Continue",
        viewDetails: "📍 View Details",
        newRequest: "🔄 New Request",
        trackAnother: "🔍 Track Another",
        more: "➡️ More",
        back: "⬅️ Back",
        sessionTimeout: "⏰ Session expired due to inactivity. Let's start over!",
        help: "📋 *Available Commands*\n\n• menu - Return to main menu\n• cancel - Cancel current operation\n• help - Show this message\n\n*Admin Commands:*\n• /bot on - Turn global bot ON\n• /bot off - Turn global bot OFF\n• /status - Check global status\n• /set user [number] bot - Set user to auto mode\n• /set user [number] manual - Set user to manual mode\n• /status user [number] - Show user mode\n• /reply [number] [message] - Reply to a customer",
        botOffMessage: "",
        botOnMessage: "🤖 Bot is now *active* and will respond automatically.",
        botOff: "🤖 Bot is now *OFF* (silent mode). All messages will be forwarded to admin.",
        botOn: "🤖 Bot is now *ON*. Automatic responses are enabled.",
        botStatus: "🤖 *Bot Status:* {status}\n\n{statusMessage}",
        botStatusOn: "Global bot is ON. Per‑user settings apply.",
        botStatusOff: "Global bot is OFF. All messages are manual.",
        botAlreadyOff: "🤖 Bot is already OFF.",
        botAlreadyOn: "🤖 Bot is already ON.",
        userSet: "✅ User {number} set to {mode} mode.",
        userModeStatus: "👤 User {number} is in *{mode}* mode.",
        noUserFound: "❌ No user found with that number.",
        invalidCommand: "❌ Invalid command. Use /set user [number] bot|manual"
    },
    sn: {
        welcome: "👋 Mhoro! Ini ndiri chase the transporter. Nyora 'Hi' kuti utange.",
        languageSelect: "Sarudza mutauro wako:",
        mainMenu: "Tinokubatsira sei nhasi?",
        courier: "📦 Basa Rekutumira",
        track: "🔍 Tsvaga Pasuru",
        bike: "🏍️ Kutumira Nemudhudhudhu",
        taxi: "🚖 Tekisi kuenda Gweru",
        price: "💰 Mitengo",
        location: "📍 Mahofisi Edu",
        agent: "👤 Taura ne Mumiriri",
        about: "ℹ️ Nezvedu",
        aboutText: "Chase the transporter ibasa rekutumira zvinhu rakavimbika rinoshandira munzira yeHarare–Bulawayo.",
        priceList: "💰 *Mitengo*\n\n• Pasuru diki (<5kg): $5\n• Pasuru yepakati (5-10kg): $10\n• Pasuru hombe (10-20kg): $15\n• Foni/Kombiyuta: $10\n• Kutumira Nemudhudhudhu (Harare): $3 - $10",
        officeLocations: "📍 *Mahofisi Edu*\n\n*BULAWAYO*\nMAIN STREET PLAZA, Shop 14\nBvunza PAMELA\n📞 +263 77 501 8137\n\n*GWERU*\nTOPSY TIM MALL, Shop 10\n📞 0781178955",
        courierPickup: "📍 Uchasiya pasuru yako kupi?",
        pickupInfo: "📦 *Nzvimbo Yekusiya Pasuru*\n\n📍 *Nzvimbo:* {location}\n🕒 *Nguva:* {time}\n📞 *Bata:* {contact}\n\nNdapota sangana nemumiriri wedu panzvimbo iyi panguva yakatarwa.\n\nDzvanya kuti utaure: {whatsapp}",
        trackPrompt: "🔍 Sarudza kwaunoenda kutsvaga pasuru yako:",
        trackingInfo: "🔍 *Ruzivo rweKutsvaga Pasuru*\n\n📍 *Kuenda:* {destination}\n🏢 *Nzvimbo Yokutora:* {dropPoint}\n📮 *Kero:* {address}\n📞 *Mumiriri:* {contact}\n📱 Dzvanya kuti utaure: {whatsapp}\n\n📅 *Zuva Rokutora:* Mangwana\n🕒 *Nguva:* Kubva 8:30 AM\n\n⚠️ *Mari Yekuchengetera:* $2 kana isina kutotorwa mukati maawa 36",
        bikePrompt: "🏍️ *Kutumira Nemudhudhudhu (Harare)*\n\nNyora nzvimbo yako:",
        bikePrice: "✅ Kuendesa ku *{area}* kunodhura {price}",
        bikeBooking: "Kuti ubhuke, pindura nezita nenhamba.\nNyora 'agent' kana 'menu'.",
        taxiPrompt: "🚖 *Tekisi kuenda Gweru*\n\nMutengo: $10 pamunhu.\nVanhu vangani? (1-9)",
        taxiConfirm: "✅ Tekisi yakabhukirwa vanhu {people}. Mari: ${total}\n\nMumiriri achakubata.",
        agentSelect: "Sarudza nzvimbo:",
        agentContact: "👤 *{name}*\n📞 {number}\n\n📱 Dzvanya: {whatsapp}",
        backToMenu: "🏠 Kudzokera kumenyu...",
        operationCancelled: "❌ Basa rakamiswa.",
        invalidSelection: "❌ Sarudza sarudzo inoshanda.",
        confirm: "✅ Enderera",
        change: "✏️ Shandura",
        cancel: "❌ Kanzura",
        continue: "📦 Enderera",
        viewDetails: "📍 Ona Nzvimbo",
        newRequest: "🔄 Chitsva",
        trackAnother: "🔍 Tsvaga Imwe",
        sessionTimeout: "⏰ Nguva yakapfuura. Ngatitangezve!",
        help: "📋 *Mirairo*\n\n• menu - Dzokera\n• cancel - Kanzura\n• help - Rubatsiro"
    },
    nd: {
        welcome: "👋 Sawubona! Ngingu-chase the transporter. Thayipha 'Hi' ukuqala.",
        languageSelect: "Khetha ulimi:",
        mainMenu: "Singakusiza kanjani?",
        courier: "📦 Ukuthumela",
        track: "🔍 Landelela",
        bike: "🏍️ Izithuthuthu",
        taxi: "🚖 Itekisi eGweru",
        price: "💰 Amanani",
        location: "📍 Amahhovisi",
        agent: "👤 Ummeleli",
        about: "ℹ️ Mayelana",
        aboutText: "I-chase the transporter yinkonzo yokuthumela izinto ethembekileyo esebenza emzileni weHarare–Bulawayo.",
        priceList: "💰 *Amanani*\n\n• Iphasela elincane (<5kg): $5\n• Iphasela eliphakathi (5-10kg): $10\n• Iphasela elikhulu (10-20kg): $15\n• Ifoni/Laptop: $10\n• Izithuthuthu (Harare): $3 - $10",
        officeLocations: "📍 *Amahhovisi*\n\n*BULAWAYO*\nMAIN STREET PLAZA, Shop 14\nBuza uPAMELA\n📞 +263 77 501 8137\n\n*GWERU*\nTOPSY TIM MALL, Shop 10\n📞 0781178955",
        courierPickup: "📍 Uzoshiya kuphi iphasela lakho?",
        pickupInfo: "📦 *Indawo Yokushiya Iphasela*\n\n📍 *Indawo:* {location}\n🕒 *Isikhathi:* {time}\n📞 *Xhumana:* {contact}\n\nSicela uhlangane nommeleli wethu kule ndawo ngesikhathi esishiwo.\n\nChofoza ukuze ukhulume: {whatsapp}",
        trackPrompt: "🔍 Khetha lapho uya khona ukulandelela iphasela:",
        trackingInfo: "🔍 *Ukulandelela Iphasela*\n\n📍 *Ukuya:* {destination}\n🏢 *Indawo Yokuthatha:* {dropPoint}\n📮 *Ikheli:* {address}\n📞 *Ummeleli:* {contact}\n📱 Chofoza ukuze ukhulume: {whatsapp}\n\n📅 *Usuku:* Kusasa\n🕒 *Isikhathi:* Kusukela ngo 8:30 AM\n\n⚠️ *Imali Yokugcina:* $2 uma ingathathwanga",
        bikePrompt: "🏍️ *Izithuthuthu (Harare)*\n\nFaka indawo yakho:",
        bikePrice: "✅ Ukulethwa e-*{area}* kubiza {price}",
        bikeBooking: "Ukubhukha, phendula ngegama nenombolo.\nThayipha 'agent' noma 'menu'.",
        taxiPrompt: "🚖 *Itekisi eGweru*\n\nInani: $10 umuntu.\nBangaki? (1-9)",
        taxiConfirm: "✅ Itekisi ibhukhiwe abantu {people}. Inani: ${total}\n\nUmmeleli uzakuthinta.",
        agentSelect: "Khetha indawo:",
        agentContact: "👤 *{name}*\n📞 {number}\n\n📱 Chofoza: {whatsapp}",
        backToMenu: "🏠 Ukubuyela emenywini...",
        operationCancelled: "❌ Umsebenzi ukhanseliwe.",
        invalidSelection: "❌ Khetha okusebenzayo.",
        confirm: "✅ Qhubeka",
        change: "✏️ Shintsha",
        cancel: "❌ Khansela",
        continue: "📦 Qhubeka",
        viewDetails: "📍 Imininingwane",
        newRequest: "🔄 Elisha",
        trackAnother: "🔍 Landelela Okunye",
        sessionTimeout: "⏰ Isikhathi siphelile. Ake siqale phansi!",
        help: "📋 *Imiyalo*\n\n• menu - Buyela\n• cancel - Khansela\n• help - Usizo"
    }
};

// Main menu options
const mainMenu = [
    { id: "courier", title: "📦 Courier Service" },
    { id: "track", title: "🔍 Track Parcel" },
    { id: "bike", title: "🏍️ Bike Delivery" },
    { id: "taxi", title: "🚖 Taxi to Gweru" },
    { id: "price", title: "💰 Price List" },
    { id: "location", title: "📍 Office Locations" },
    { id: "agent", title: "👤 Speak to Agent" },
    { id: "about", title: "ℹ️ About Us" }
];

const locationList = locations.map(loc => ({
    id: loc,
    title: loc,
    description: `Select ${loc}`
}));

// ===============================
// 🧠 USER STATE
// ===============================
let users = {};

function normalize(text) {
    return text ? text.toString().toLowerCase().trim() : '';
}

function findBikePrice(area) {
    const norm = normalize(area);
    const knownSuburbs = {
        "chisipiti": "$7", "chisipite": "$7", "borrowdale": "$7",
        "avondale": "$5", "hatfield": "$7", "cbd": "$3", "avenue": "$3"
    };
    return bikePrices[norm] || knownSuburbs[norm] || null;
}

function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function t(userId, key, replacements = {}) {
    const user = users[userId] || { language: 'en' };
    const lang = user.language || 'en';
    let str = translations[lang]?.[key] || translations.en[key] || key;
    for (let [k, v] of Object.entries(replacements)) {
        str = str.replace(new RegExp(`{${k}}`, 'g'), v);
    }
    return str;
}

async function forwardToAdmin(from, message, originalText) {
    const adminMessage = `📨 *NEW MESSAGE*\n\n👤 Customer: ${from}\n💬 Message: ${message}\n\n⏰ Time: ${new Date().toLocaleString()}\n\n📝 *To reply:* /reply ${from} [your message]`;
    await sendMessage(adminNumber, adminMessage);
    console.log(`📨 Message forwarded to admin from ${from}`);
}

function isAdmin(number) {
    return number === adminNumber;
}

function updateUserActivity(userId) {
    userLastActivity[userId] = Date.now();
}

function checkSessionExpired(userId) {
    const lastActive = userLastActivity[userId];
    if (lastActive && (Date.now() - lastActive > SESSION_TIMEOUT)) {
        if (users[userId]) {
            users[userId] = {
                step: 'welcome',
                language: users[userId].language || 'en',
                data: {}
            };
            console.log(`🕐 Session expired for ${userId}, reset to welcome`);
        }
        delete userLastActivity[userId];
        return true;
    }
    return false;
}

function shouldAutoRespondForUser(userId) {
    if (!botMode) return false;
    const mode = userMode[userId] || 'bot';
    return mode === 'bot';
}

// ===============================
// 🔐 WEBHOOK VERIFICATION
// ===============================
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified");
        return res.status(200).send(challenge);
    }
    res.sendStatus(403);
});

// ===============================
// 📥 MAIN MESSAGE HANDLER
// ===============================
app.post("/webhook", async (req, res) => {
    res.sendStatus(200);
    
    try {
        const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        if (!msg) return;

        const from = msg.from;
        let text = msg.text?.body || 
                   msg.interactive?.button_reply?.id ||
                   msg.interactive?.list_reply?.id;
        if (!text) return;
        
        const originalText = text;
        text = text.toLowerCase();
        console.log(`\n📩 [${from}] >> ${text}`);

        // ========== ADMIN COMMANDS ==========
        if (isAdmin(from)) {
            if (text === '/bot off') {
                if (!botMode) {
                    await sendMessage(from, t(from, 'botAlreadyOff'));
                    return;
                }
                botMode = false;
                await sendMessage(from, t(from, 'botOff'));
                console.log("🤖 Global bot turned OFF");
                return;
            }
            if (text === '/bot on') {
                if (botMode) {
                    await sendMessage(from, t(from, 'botAlreadyOn'));
                    return;
                }
                botMode = true;
                await sendMessage(from, t(from, 'botOn'));
                console.log("🤖 Global bot turned ON");
                return;
            }
            if (text === '/status') {
                const status = botMode ? "ON 🟢" : "OFF 🔴";
                const statusMessage = botMode ? t(from, 'botStatusOn') : t(from, 'botStatusOff');
                await sendMessage(from, t(from, 'botStatus', { status: status, statusMessage: statusMessage }));
                return;
            }
            if (text.startsWith('/set user ')) {
                const parts = originalText.split(' ');
                if (parts.length >= 4) {
                    const targetNumber = parts[2];
                    const mode = parts[3].toLowerCase();
                    if (mode === 'bot' || mode === 'manual') {
                        userMode[targetNumber] = mode;
                        await sendMessage(from, t(from, 'userSet', { number: targetNumber, mode: mode }));
                        console.log(`👤 User ${targetNumber} set to ${mode} mode`);
                    } else {
                        await sendMessage(from, t(from, 'invalidCommand'));
                    }
                } else {
                    await sendMessage(from, t(from, 'invalidCommand'));
                }
                return;
            }
            if (text.startsWith('/status user ')) {
                const parts = originalText.split(' ');
                if (parts.length >= 3) {
                    const targetNumber = parts[2];
                    const mode = userMode[targetNumber] || 'bot';
                    await sendMessage(from, t(from, 'userModeStatus', { number: targetNumber, mode: mode }));
                }
                return;
            }
            if (text.startsWith('/reply ')) {
                const parts = originalText.split(' ');
                if (parts.length >= 3) {
                    const customerNumber = parts[1];
                    const replyMessage = parts.slice(2).join(' ');
                    await sendMessage(customerNumber, `👤 *Agent Response:*\n\n${replyMessage}`);
                    await sendMessage(from, `✅ Reply sent to ${customerNumber}`);
                    console.log(`📤 Manual reply sent to ${customerNumber}`);
                }
                return;
            }
        }

        // ========== BOT MODE DECISION ==========
        let shouldAutoRespond = false;
        if (botMode) {
            const userModeSetting = userMode[from] || 'bot';
            shouldAutoRespond = (userModeSetting === 'bot');
        } else {
            shouldAutoRespond = false;
        }

        if (!shouldAutoRespond && !isAdmin(from)) {
            await forwardToAdmin(from, originalText, text);
            return;
        }

        // ========== AUTO-RESPONSE MODE ==========
        updateUserActivity(from);
        if (checkSessionExpired(from)) {
            await sendMessage(from, t(from, 'sessionTimeout'));
            await sendMessage(from, t(from, 'welcome'));
            return;
        }

        if (!users[from]) {
            users[from] = {
                step: 'welcome',
                language: 'en',
                data: {}
            };
        }

        const user = users[from];

        // Global commands
        if (text === 'menu' || text === 'main menu') {
            user.step = 'menu';
            await sendMessage(from, t(from, 'backToMenu'));
            await sendMainMenu(from);
            return;
        }
        if (text === 'help') {
            await sendMessage(from, t(from, 'help'));
            return;
        }
        if (text === 'cancel') {
            user.step = 'menu';
            await sendMessage(from, t(from, 'operationCancelled'));
            await sendMainMenu(from);
            return;
        }

        // Welcome state
        if (user.step === 'welcome') {
            if (['hi', 'hello', 'hey', 'start'].includes(text)) {
                user.step = 'language';
                await sendLanguageButtons(from);
            } else {
                await sendMessage(from, t(from, 'welcome'));
            }
            return;
        }

        // Language state
        if (user.step === 'language') {
            if (['lang_en', 'lang_sn', 'lang_nd'].includes(text)) {
                user.language = text.split('_')[1];
                user.step = 'menu';
                await sendMessage(from, t(from, 'mainMenu'));
                await sendMainMenu(from);
            } else {
                await sendLanguageButtons(from);
            }
            return;
        }

        // Menu state
        if (user.step === 'menu') {
            switch(text) {
                case 'courier':
                    user.step = 'courier_pickup';
                    user.data = {};
                    await sendLocationList(from, t(from, 'courierPickup'));
                    break;
                case 'track':
                    user.step = 'track';
                    user.data = {};
                    await sendLocationList(from, t(from, 'trackPrompt'));
                    break;
                case 'bike':
                    user.step = 'bike';
                    await sendMessage(from, t(from, 'bikePrompt'));
                    break;
                case 'taxi':
                    user.step = 'taxi';
                    await sendMessage(from, t(from, 'taxiPrompt'));
                    break;
                case 'price':
                    await sendMessage(from, t(from, 'priceList'));
                    await sendMainMenu(from);
                    break;
                case 'location':
                    await sendMessage(from, t(from, 'officeLocations'));
                    await sendMainMenu(from);
                    break;
                case 'agent':
                    user.step = 'agent';
                    await sendAgentOptions(from);
                    break;
                case 'about':
                    await sendMessage(from, t(from, 'aboutText'));
                    await sendMainMenu(from);
                    break;
                default:
                    await sendMainMenu(from);
            }
            return;
        }

        // ===== COURIER FLOW (PICKUP ONLY) =====
        if (user.step === 'courier_pickup') {
            const location = locations.find(l => l.toLowerCase() === text);
            if (location) {
                const details = pickupDetails[location];
                const message = t(from, 'pickupInfo', {
                    location: details.location + (details.address ? `\n📮 ${details.address}` : ''),
                    time: details.time,
                    contact: details.contact,
                    whatsapp: details.whatsapp
                });
                await sendMessage(from, message);
                
                await sendButtons(from, "What would you like to do next?", [
                    { id: "menu", title: t(from, 'backToMenu') }
                ]);
                user.step = 'menu';
            } else {
                await sendMessage(from, t(from, 'invalidSelection'));
                await sendLocationList(from, t(from, 'courierPickup'));
            }
            return;
        }

        // ===== TRACK STATE =====
        if (user.step === 'track') {
            const destination = locations.find(l => l.toLowerCase() === text);
            if (destination) {
                const details = destinationDetails[destination];
                const message = t(from, 'trackingInfo', {
                    destination: destination,
                    dropPoint: details.dropPoint,
                    address: details.address,
                    contact: details.contact,
                    whatsapp: details.whatsapp
                });
                await sendMessage(from, message);
                
                await sendButtons(from, "What would you like to do next?", [
                    { id: "track", title: t(from, 'trackAnother') },
                    { id: "menu", title: t(from, 'backToMenu') }
                ]);
                user.step = 'menu';
            } else if (text === 'main_menu' || text === 'menu') {
                user.step = 'menu';
                await sendMainMenu(from);
            } else {
                await sendMessage(from, t(from, 'invalidSelection'));
                await sendLocationList(from, t(from, 'trackPrompt'));
            }
            return;
        }

        // ===== BIKE STATE =====
        if (user.step === 'bike') {
            if (text === 'menu') {
                user.step = 'menu';
                await sendMainMenu(from);
                return;
            }
            const price = findBikePrice(text);
            if (price) {
                await sendMessage(from, t(from, 'bikePrice', { area: originalText, price: price }));
                await sendMessage(from, t(from, 'bikeBooking'));
                user.step = 'bike_booking';
                user.data.area = originalText;
                user.data.price = price;
            } else {
                await sendMessage(from, t(from, 'invalidSelection'));
            }
            return;
        }

        if (user.step === 'bike_booking') {
            if (text === 'menu') {
                user.step = 'menu';
                await sendMainMenu(from);
                return;
            }
            if (text === 'agent') {
                await sendAgentContact(from, 'Harare');
                user.step = 'menu';
                setTimeout(() => sendMainMenu(from), 1000);
            } else {
                await sendMessage(from, `✅ Booking received! An agent will contact you shortly at ${originalText}`);
                user.step = 'menu';
                await sendMainMenu(from);
            }
            return;
        }

        // ===== TAXI STATE =====
        if (user.step === 'taxi') {
            if (text === 'menu') {
                user.step = 'menu';
                await sendMainMenu(from);
                return;
            }
            const num = parseInt(text);
            if (!isNaN(num) && num > 0 && num < 10) {
                await sendMessage(from, t(from, 'taxiConfirm', { people: num, total: num * 10 }));
                user.step = 'menu';
                await sendMainMenu(from);
            } else {
                await sendMessage(from, t(from, 'invalidSelection'));
            }
            return;
        }

        // ===== AGENT STATE =====
        if (user.step === 'agent') {
            if (text === 'menu') {
                user.step = 'menu';
                await sendMainMenu(from);
                return;
            }
            const location = text.charAt(0).toUpperCase() + text.slice(1);
            if (agents[location]) {
                await sendAgentContact(from, location);
                user.step = 'menu';
                setTimeout(() => sendMainMenu(from), 1000);
            } else {
                await sendMessage(from, t(from, 'invalidSelection'));
                await sendAgentOptions(from);
            }
            return;
        }

        user.step = 'menu';
        await sendMainMenu(from);

    } catch (err) {
        console.error("❌ ERROR:", err);
    }
});

// ===============================
// 📤 SEND FUNCTIONS
// ===============================
async function sendMessage(to, text) {
    if (!text || text === "") return;
    try {
        await axios.post(
            `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
            { messaging_product: "whatsapp", to, text: { body: text } },
            { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, httpsAgent: agent }
        );
        console.log(`✅ [${to}] << ${text.substring(0, 40)}...`);
    } catch (error) {
        console.log("❌ Send error:", error.response?.data || error.message);
    }
}

async function sendButtons(to, bodyText, buttons) {
    if (!shouldAutoRespondForUser(to) && !isAdmin(to)) return;
    try {
        const validButtons = buttons.filter(b => b && b.id && b.title);
        if (validButtons.length > 3) validButtons.length = 3;
        if (validButtons.length === 0) return;
        await axios.post(
            `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: { text: bodyText },
                    action: { buttons: validButtons.map(b => ({ type: "reply", reply: { id: b.id, title: b.title.substring(0, 20) } })) }
                }
            },
            { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, httpsAgent: agent }
        );
        console.log(`✅ Buttons sent to ${to}`);
    } catch (error) {
        console.log("❌ Buttons error:", error.response?.data || error.message);
    }
}

async function sendList(to, bodyText, buttonText, rows) {
    if (!shouldAutoRespondForUser(to) && !isAdmin(to)) return;
    try {
        const validRows = rows.filter(r => r && r.id && r.title).slice(0, 10);
        await axios.post(
            `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "interactive",
                interactive: {
                    type: "list",
                    body: { text: bodyText },
                    action: { button: buttonText, sections: [{ title: "Select Option", rows: validRows }] }
                }
            },
            { headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }, httpsAgent: agent }
        );
        console.log(`✅ List sent to ${to}`);
    } catch (error) {
        console.log("❌ List error:", error.response?.data || error.message);
    }
}

// ===============================
// 🎯 BOT FUNCTIONS
// ===============================
async function sendLocationList(to, prompt) {
    await sendList(to, prompt, "📋 View Locations", locationList);
}

async function sendLanguageButtons(to) {
    await sendButtons(to, t(to, 'languageSelect'), [
        { id: "lang_en", title: "🇬🇧 English" },
        { id: "lang_sn", title: "🇿🇼 Shona" },
        { id: "lang_nd", title: "🇿🇼 Ndebele" }
    ]);
}

async function sendMainMenu(to) {
    if (!shouldAutoRespondForUser(to) && !isAdmin(to)) return;
    const user = users[to];
    const lang = user?.language || 'en';
    const menuTranslated = mainMenu.map(item => ({
        id: item.id,
        title: t(to, item.id.split(' ')[0].toLowerCase())
    }));
    await sendList(to, t(to, 'mainMenu'), "View Menu", menuTranslated);
}

async function sendAgentOptions(to) {
    await sendButtons(to, t(to, 'agentSelect'), [
        { id: "Harare", title: "Harare" },
        { id: "Bulawayo", title: "Bulawayo" },
        { id: "Gweru", title: "Gweru" }
    ]);
}

async function sendAgentContact(to, location) {
    const agent = agents[location];
    const message = t(to, 'agentContact', {
        name: agent.name,
        number: agent.number,
        whatsapp: agent.whatsapp
    });
    await sendMessage(to, message);
}

// ===============================
// 🚀 START SERVER
// ===============================
const PORT = 4000;
app.listen(PORT, () => {
    console.log("\n🚀 Chase The Transporter Courier Bot");
    console.log("====================================");
    console.log(`📱 Port: ${PORT}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 15)}...`);
    console.log(`👤 Admin Number: ${adminNumber}`);
    console.log(`🤖 Global Bot Mode: ${botMode ? "ON 🟢" : "OFF 🔴"}`);
    console.log(`⏰ Session Timeout: ${SESSION_TIMEOUT / 60000} minutes`);
    console.log("====================================\n");
    console.log("📋 Admin Commands:");
    console.log("  /bot on               - Turn global bot ON");
    console.log("  /bot off              - Turn global bot OFF");
    console.log("  /status               - Show global status");
    console.log("  /set user [number] bot    - Set user to auto mode");
    console.log("  /set user [number] manual - Set user to manual mode");
    console.log("  /status user [number]     - Show user's mode");
    console.log("  /reply [number] [msg]     - Reply to a customer");
    console.log("====================================\n");
    console.log("💡 Courier Service: User selects pickup location, gets pickup details, then returns to menu.");
    console.log("💡 Tracking: User selects destination, gets drop-off location and agent contact.\n");
});
