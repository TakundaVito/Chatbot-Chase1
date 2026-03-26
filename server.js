const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const https = require("https");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// ===============================
// 🔑 CONFIGURATION
// ===============================
// const TOKEN = "EAAM57Ve9x3oBRPShdwShzWrD1S3eMZC4Oe5vSnN2diMiHqRudLpyiLjxiuCFMi1wt0I7utiTiz9WVrv6XDdlSS2TPZA3ISBeY8V5AoWDEx5gO2tqUhspVfK5MpWuVMs5HhdkNCoa85KinPjfsb8mqGDjC2sZCiJ4k5tzZApfbd4Mj4MsNWIYGxGv3R4uglzHfAZDZD";
// const PHONE_NUMBER_ID = "1047943131730645";
// const VERIFY_TOKEN = "chase123";
const TOKEN = process.env.TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.listen(process.env.PORT || 4000, () => {
  console.log("Server running...");
});

if (!TOKEN || !PHONE_NUMBER_ID || !VERIFY_TOKEN) {
  console.error("Missing environment variables!");
}
const agent = new https.Agent({ family: 4 });

// ===============================
// 🤖 BOT MODE TOGGLE & SESSION MANAGEMENT
// ===============================
let botMode = true; // true = bot active, false = manual mode (silent)
let adminNumber = "263775837909"; // Your WhatsApp number (admin)
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes timeout
let userLastActivity = {}; // Track last activity time for each user

// Session cleanup interval (run every minute)
setInterval(() => {
    const now = Date.now();
    for (const [userId, lastActive] of Object.entries(userLastActivity)) {
        if (now - lastActive > SESSION_TIMEOUT) {
            // Reset user session
            if (users[userId]) {
                users[userId] = {
                    step: 'welcome',
                    language: 'en',
                    data: {}
                };
                console.log(`🕐 Session timeout for ${userId}, reset to welcome state`);
            }
            delete userLastActivity[userId];
        }
    }
}, 60000); // Check every minute

// ===============================
// 📚 DATA
// ===============================
const locations = [
    "Harare", "Norton", "Chegutu", "Kadoma", "Kwekwe", "Gweru", "Bulawayo"
];

const locationDetails = {
    'Harare': {
        dropPoint: 'Harare Main Terminal',
        address: 'Robert Mugabe Road, Opposite Harare Gardens',
        contact: 'Agent Tinashe',
        phone: '263785168309',
        dropTime: '11:30 – 12:00',
        pickupTime: 'Next day from 8:30 AM',
        price: '$5 - $15 depending on size',
        agentNumber: '263785168309'
    },
    'Norton': {
        dropPoint: 'Karina',
        address: 'Main Bus Stop',
        contact: 'Agent Michael',
        phone: '263785168309',
        dropTime: '14:14 – 14:30',
        pickupTime: 'Next day from 8:30 AM',
        price: '$5 - $15 depending on size',
        agentNumber: '263785168309'
    },
    'Chegutu': {
        dropPoint: 'Engen Garage',
        address: 'Along Harare-Bulawayo Road',
        contact: 'Agent Tinashe',
        phone: '263785168309',
        dropTime: '15:00 – 15:30',
        pickupTime: 'Next day from 8:30 AM',
        price: '$5 - $15 depending on size',
        agentNumber: '263785168309'
    },
    'Kadoma': {
        dropPoint: 'Waverly Bus stop',
        address: 'NEXT TO THE STAGE',
        contact: 'Agent Tinashe',
        phone: '263785168309',
        dropTime: '16:00 – 16:30',
        pickupTime: 'Next day from 8:30 AM',
        price: '$5 - $15 depending on size',
        agentNumber: '263785168309'
    },
    'Kwekwe': {
        dropPoint: 'Eat n Lick TOTAL GARAGE',
        address: 'Main Road',
        contact: 'Agent Tinashe',
        phone: '0781178955',
        dropTime: '17:00 – 17:30',
        pickupTime: 'Next day from 8:30 AM',
        price: '$5 - $15 depending on size',
        agentNumber: '0781178955'
    },
    'Gweru': {
        dropPoint: 'TOPSY TIM MALL',
        address: 'Along 6th Street (old CLUB UPTOWN), opposite BETHEL CLINIC, Shop 10',
        contact: 'Gweru Office',
        phone: '0781178955',
        dropTime: '18:00 – 18:30',
        pickupTime: 'Next day from 8:30 AM',
        price: '$5 - $15 depending on size',
        agentNumber: '0781178955'
    },
    'Bulawayo': {
        dropPoint: 'MAIN STREET PLAZA',
        address: 'Main Street between 11th & 12th Avenue (Next to N1 HOTEL), Shop 14',
        contact: 'Ask for PAMELA',
        phone: '+263 77 501 8137',
        dropTime: '18:30 – 19:00',
        pickupTime: 'Next day from 8:30 AM',
        collectionHours: 'Mon–Sat 8:30AM–3PM, Sun 9AM–11AM',
        price: '$5 - $15 depending on size',
        agentNumber: '263775018137'
    }
};

const destinationCollectionPoints = {
    'Bulawayo': '📍 *MAIN STREET PLAZA*\n📮 Main Street between 11th & 12th Avenue (Next to N1 HOTEL)\n🛒 Shop 14\n👤 Ask for PAMELA\n📞 +263 77 501 8137\n🕒 Collection Hours: Mon–Sat 8:30AM–3PM, Sun 9AM–11AM',
    'Gweru': '📍 *TOPSY TIM MALL*\n📮 Along 6th Street (old CLUB UPTOWN), opposite BETHEL CLINIC\n🛒 Shop 10\n📞 0781178955\n🕒 Mon–Sat 8AM–7PM, Sun 1:30PM–7PM',
    'Kwekwe': '📍 *Eat n Lick TOTAL GARAGE*\n📮 Main Road\n📞 Contact Agent Tinashe\n🕒 Collection: Next day 8:30 AM',
    'Kadoma': '📍 *Waverly Bus stop*\n📮 NEXT TO THE STAGE\n📞 Contact Agent Tinashe\n🕒 Collection: Next day 8:30 AM',
    'Chegutu': '📍 *Engen Garage*\n📮 Along Harare-Bulawayo Road\n📞 Contact Agent Tinashe\n🕒 Collection: Next day 8:30 AM',
    'Norton': '📍 *Karina*\n📮 Main Bus Stop\n📞 Contact Agent Michael\n🕒 Collection: Next day 8:30 AM',
    'Harare': '📍 *Harare Main Terminal*\n📮 Robert Mugabe Road, Opposite Harare Gardens\n📞 Contact: Agent Tinashe\n🕒 Collection: Next day 8:30 AM'
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
        aboutText: "Chase the transporter is a trusted courier service operating along the Harare–Bulawayo route and within Harare via bike delivery. We offer reliable parcel delivery with daily scheduled runs.",
        priceList: "💰 *Price List*\n\n• Courier Service: $5 - $15 depending on size\n• Bike Delivery: $3 - $10 depending on zone\n• Taxi to Gweru: $10 per person\n• Phone/Laptop: $10 flat rate",
        officeLocations: "📍 *Our Offices*\n\n*BULAWAYO*\nMAIN STREET PLAZA, Shop 14\nAsk for PAMELA\n📞 +263 77 501 8137\n\n*GWERU*\nTOPSY TIM MALL, Shop 10\n📞 0781178955",
        courierPickup: "📍 Where will your parcel be collected from?",
        courierDelivery: "📍 Where should your parcel be delivered?",
        confirmCourier: "✅ *Confirm Courier Details*\n\n📦 Pickup: {pickup}\n🎯 Destination: {delivery}\n📅 Drop Time: {dropTime}\n\nIs this correct?",
        dropoffInstructions: "📦 *Drop-off Instructions*\n\nPlease drop off your parcel at:\n\n🏢 {dropPoint}\n📮 {address}\n📞 Contact: {contact} ({phone})\n\n🕒 Drop Time: {dropTime}",
        courierSummary: "📦 *Courier Service Summary*\n\n📍 *Pickup Location:* {pickup}\n🏢 *Drop-off Point:* {pickupPoint}\n📮 *Address:* {pickupAddress}\n📞 *Contact:* {pickupContact}\n🕒 *Drop Time:* {pickupDropTime}\n\n📍 *Delivery Location:* {delivery}\n🏢 *Collection Point:* {deliveryPoint}\n📮 *Address:* {deliveryAddress}\n📞 *Agent:* {deliveryContact}\n\n💰 *Price:* {price}\n\n📅 *Collection Date:* Tomorrow\n🕒 *Collection Time:* From 8:30 AM\n\n⚠️ *Storage Fee:* $2 if not collected within 36 hours\n\n📞 *Need Help?* Contact the {delivery} agent:\n👤 {agentName}\n📱 Click to chat: {whatsapp}",
        deliveryInfo: "🚚 *Delivery Information*\n\nYour parcel from {pickup} to {delivery} will be delivered tomorrow morning.\n\n📅 Available for collection from 8:30 AM on {date} at the destination drop point.\n\n⚠️ Storage fee of $2 applies if not collected within 36 hours.",
        trackPrompt: "🔍 Enter your tracking number or select destination:",
        trackingInfo: "🔍 *Parcel Tracking Information*\n\n📍 *Destination:* {destination}\n📅 *Collection Date:* {date}\n🕒 *Collection Time:* From 8:30 AM\n\n🏢 *Collection Point:*\n{collectionPoint}\n\n⚠️ *Storage Fee:* $2 will be charged if parcel is not collected within 36 hours.\n\n📞 *Need Help?* Contact the {destination} agent:\n👤 {agentName}\n📱 Click to chat: {whatsapp}",
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
        confirm: "✅ Yes, Continue",
        change: "✏️ Change",
        cancel: "❌ Cancel",
        continue: "📦 Continue",
        viewDetails: "📍 View Destination Details",
        newRequest: "🔄 New Request",
        more: "➡️ More",
        back: "⬅️ Back",
        sessionTimeout: "⏰ Session expired due to inactivity. Let's start over!",
        help: "📋 *Available Commands*\n\n• menu - Return to main menu\n• cancel - Cancel current operation\n• help - Show this message\n\n*Admin Commands:*\n• /bot on - Turn bot ON\n• /bot off - Turn bot OFF (silent mode)\n• /status - Check bot status\n• /reply [number] [message] - Reply to customer",
        botOffMessage: "", // EMPTY - No message sent to customers in manual mode
        botOnMessage: "🤖 Bot is now *active* and will respond automatically.",
        botOff: "🤖 Bot is now *OFF* (silent mode). All messages will be forwarded to admin.",
        botOn: "🤖 Bot is now *ON*. Automatic responses are enabled.",
        botStatus: "🤖 *Bot Status:* {status}\n\n{statusMessage}",
        botStatusOn: "Bot is ACTIVE and responding automatically.",
        botStatusOff: "Bot is OFF (silent mode). All customer messages are being forwarded to admin without automatic responses."
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
        aboutText: "Chase the transporter ibasa rekutumira zvinhu rakavimbika rinoshandira munzira yeHarare–Bulawayo uye mukati meHarare nekutumira nemidhudhudhu.",
        priceList: "💰 *Mitengo*\n\n• Basa Rekutumira: $5 - $15 zvinoenderana nehukuru\n• Kutumira Nemudhudhudhu: $3 - $10 zvinoenderana nenzvimbo\n• Tekisi kuenda Gweru: $10 pamunhu\n• Foni/Kombiyuta: $10",
        officeLocations: "📍 *Mahofisi Edu*\n\n*BULAWAYO*\nMAIN STREET PLAZA, Shop 14\nBvunza PAMELA\n📞 +263 77 501 8137\n\n*GWERU*\nTOPSY TIM MALL, Shop 10\n📞 0781178955",
        courierPickup: "📍 Pasuru yako ichatorwa kupi?",
        courierDelivery: "📍 Pasuru yako ichaendeswa kupi?",
        confirmCourier: "✅ *Simbisa Ruzivo*\n\n📦 Kunotora: {pickup}\n🎯 Kuenda: {delivery}\n📅 Nguva: {dropTime}\n\nIzvi zvakarurama?",
        dropoffInstructions: "📦 *Mirayiridzo*\n\nSiya pasuru yako pano:\n\n🏢 {dropPoint}\n📮 {address}\n📞 Bata: {contact} ({phone})\n\n🕒 Nguva: {dropTime}",
        courierSummary: "📦 *Ruzivo rweKutumira*\n\n📍 *Kunotora:* {pickup}\n🏢 *Nzvimbo:* {pickupPoint}\n📮 *Kero:* {pickupAddress}\n📞 *Bata:* {pickupContact}\n🕒 *Nguva:* {pickupDropTime}\n\n📍 *Kuenda:* {delivery}\n🏢 *Nzvimbo Yokutora:* {deliveryPoint}\n📮 *Kero:* {deliveryAddress}\n📞 *Mumiriri:* {deliveryContact}\n\n💰 *Mutengo:* {price}\n\n📅 *Zuva Rokutora:* Mangwana\n🕒 *Nguva:* Kubva 8:30 AM\n\n⚠️ *Mari Yekuchengetera:* $2 kana isina kutotorwa mukati maawa 36\n\n📞 *Rubatsiro:* Bata mumiriri we {delivery}:\n👤 {agentName}\n📱 Dzvanya: {whatsapp}",
        deliveryInfo: "🚚 *Ruzivo rweKutumira*\n\nPasuru yako kubva {pickup} kuenda {delivery} ichaendeswa mangwana.\n\n📅 Inowanikwa kutora kubva 8:30 AM musi wa{date}.\n\n⚠️ Mari yekuchengetera ye$2 inobhadharwa.",
        trackPrompt: "🔍 Isa nhamba kana sarudza kwaunoenda:",
        trackingInfo: "🔍 *Ruzivo rweKutsvaga*\n\n📍 *Kuenda:* {destination}\n📅 *Zuva:* {date}\n🕒 *Nguva:* Kubva 8:30 AM\n\n🏢 *Nzvimbo:*\n{collectionPoint}\n\n⚠️ *Mari:* $2 kana isina kutotorwa\n\n📞 *Bata* {destination}:\n👤 {agentName}\n📱 Dzvanya: {whatsapp}",
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
        confirm: "✅ Hongu",
        change: "✏️ Shandura",
        cancel: "❌ Kanzura",
        continue: "📦 Enderera",
        viewDetails: "📍 Ona Nzvimbo",
        newRequest: "🔄 Chitsva",
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
        aboutText: "I-chase the transporter yinkonzo yokuthumela izinto ethembekileyo.",
        priceList: "💰 *Amanani*\n\n• Ukuthumela: $5 - $15\n• Izithuthuthu: $3 - $10\n• Itekisi: $10 umuntu\n• Ifoni/Laptop: $10",
        officeLocations: "📍 *Amahhovisi*\n\n*BULAWAYO*\nMAIN STREET PLAZA, Shop 14\nBuza uPAMELA\n📞 +263 77 501 8137\n\n*GWERU*\nTOPSY TIM MALL, Shop 10\n📞 0781178955",
        courierPickup: "📍 Iphasela lizothathwa kuphi?",
        courierDelivery: "📍 Iphasela kufanele lilethwe kuphi?",
        confirmCourier: "✅ *Qinisekisa*\n\n📦 Ukuthatha: {pickup}\n🎯 Ukuya: {delivery}\n📅 Isikhathi: {dropTime}\n\nKulungile?",
        dropoffInstructions: "📦 *Iziqondiso*\n\nSicela ushiye iphasela:\n\n🏢 {dropPoint}\n📮 {address}\n📞 Xhumana: {contact} ({phone})\n\n🕒 Isikhathi: {dropTime}",
        courierSummary: "📦 *Imininingwane*\n\n📍 *Ukuthatha:* {pickup}\n🏢 *Indawo:* {pickupPoint}\n📮 *Ikheli:* {pickupAddress}\n📞 *Xhumana:* {pickupContact}\n🕒 *Isikhathi:* {pickupDropTime}\n\n📍 *Ukuya:* {delivery}\n🏢 *Indawo Yokuthatha:* {deliveryPoint}\n📮 *Ikheli:* {deliveryAddress}\n📞 *Ummeleli:* {deliveryContact}\n\n💰 *Inani:* {price}\n\n📅 *Usuku:* Kusasa\n🕒 *Isikhathi:* Kusukela ngo 8:30 AM\n\n⚠️ *Imali Yokugcina:* $2 uma ingathathwanga\n\n📞 *Usizo:* Xhumana nommeleli wase{delivery}:\n👤 {agentName}\n📱 Chofoza: {whatsapp}",
        deliveryInfo: "🚚 *Ukulethwa*\n\nIphasela lakho lizolethwa kusasa.\n\n📅 Litholakala kusukela ngo 8:30 AM ngomhla ka{date}.\n\n⚠️ Imali yokugcina engu-$2 iyakhokhiswa.",
        trackPrompt: "🔍 Faka inombolo noma khetha:",
        trackingInfo: "🔍 *Ukulandelela*\n\n📍 *Ukuya:* {destination}\n📅 *Usuku:* {date}\n🕒 *Isikhathi:* Kusukela ngo 8:30 AM\n\n🏢 *Indawo:*\n{collectionPoint}\n\n⚠️ *Imali:* $2 uma ingathathwanga\n\n📞 *Xhumana* {destination}:\n👤 {agentName}\n📱 Chofoza: {whatsapp}",
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
        confirm: "✅ Yebo",
        change: "✏️ Shintsha",
        cancel: "❌ Khansela",
        continue: "📦 Qhubeka",
        viewDetails: "📍 Imininingwane",
        newRequest: "🔄 Elisha",
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

// Create location list for dropdown
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

// Get tomorrow's date
function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-ZA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Get translation
function t(userId, key, replacements = {}) {
    const user = users[userId] || { language: 'en' };
    const lang = user.language || 'en';
    
    let str = translations[lang]?.[key];
    if (!str) {
        str = translations.en[key] || key;
    }
    
    for (let [k, v] of Object.entries(replacements)) {
        str = str.replace(new RegExp(`{${k}}`, 'g'), v);
    }
    return str;
}

// Forward message to admin
async function forwardToAdmin(from, message, originalText) {
    const adminMessage = `📨 *NEW MESSAGE - MANUAL MODE*\n\n👤 Customer: ${from}\n💬 Message: ${message}\n\n⏰ Time: ${new Date().toLocaleString()}\n\n📝 *To reply:* /reply ${from} [your message]`;
    
    await sendMessage(adminNumber, adminMessage);
    console.log(`📨 Message forwarded to admin from ${from}`);
}

// Check if user is admin
function isAdmin(number) {
    return number === adminNumber;
}

// Check and update user activity
function updateUserActivity(userId) {
    userLastActivity[userId] = Date.now();
}

// Check if session expired and reset if needed
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

        // ===== ADMIN COMMANDS =====
        if (isAdmin(from)) {
            // Toggle bot on/off
            if (text === '/bot off') {
                botMode = false;
                await sendMessage(from, t(from, 'botOff'));
                console.log("🤖 Bot turned OFF - Silent manual mode activated");
                return;
            }
            
            if (text === '/bot on') {
                botMode = true;
                await sendMessage(from, t(from, 'botOn'));
                console.log("🤖 Bot turned ON - Auto mode activated");
                return;
            }
            
            if (text === '/status') {
                const status = botMode ? "ON 🟢" : "OFF 🔴";
                const statusMessage = botMode ? t(from, 'botStatusOn') : t(from, 'botStatusOff');
                await sendMessage(from, t(from, 'botStatus', { status: status, statusMessage: statusMessage }));
                return;
            }
            
            // Handle manual replies to customers
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

        // ===== BOT MODE CHECK =====
        if (!botMode && !isAdmin(from)) {
            await forwardToAdmin(from, originalText, text);
            return;
        }

        // Update user activity
        updateUserActivity(from);
        
        // Check if session expired
        if (checkSessionExpired(from)) {
            await sendMessage(from, t(from, 'sessionTimeout'));
            await sendMessage(from, t(from, 'welcome'));
            return;
        }

        // Initialize user if new
        if (!users[from]) {
            users[from] = {
                step: 'welcome',
                language: 'en',
                data: {}
            };
        }

        const user = users[from];

        // GLOBAL COMMANDS
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

        // ===== WELCOME STATE =====
        if (user.step === 'welcome') {
            if (['hi', 'hello', 'hey', 'start'].includes(text)) {
                user.step = 'language';
                await sendLanguageButtons(from);
            } else {
                await sendMessage(from, t(from, 'welcome'));
            }
            return;
        }

        // ===== LANGUAGE STATE =====
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

        // ===== MENU STATE =====
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

        // ===== COURIER FLOW =====
        if (user.step === 'courier_pickup') {
            const location = locations.find(l => l.toLowerCase() === text);
            if (location) {
                user.data.pickup = location;
                user.step = 'courier_delivery';
                await sendLocationList(from, t(from, 'courierDelivery'));
            } else {
                await sendMessage(from, t(from, 'invalidSelection'));
                await sendLocationList(from, t(from, 'courierPickup'));
            }
            return;
        }

        if (user.step === 'courier_delivery') {
            const location = locations.find(l => l.toLowerCase() === text);
            if (location) {
                user.data.delivery = location;
                user.step = 'courier_summary';
                await sendCourierSummary(from, user.data);
            } else {
                await sendMessage(from, t(from, 'invalidSelection'));
                await sendLocationList(from, t(from, 'courierDelivery'));
            }
            return;
        }

        if (user.step === 'courier_summary') {
            if (text === 'confirm' || text === 'yes') {
                user.step = 'courier_booking';
                await sendMessage(from, "✅ Your courier request has been submitted! An agent will contact you shortly to confirm pickup details.");
                user.step = 'menu';
                await sendMainMenu(from);
            } else if (text === 'change') {
                user.step = 'courier_pickup';
                user.data = {};
                await sendLocationList(from, t(from, 'courierPickup'));
            } else if (text === 'cancel') {
                user.step = 'menu';
                await sendMessage(from, t(from, 'operationCancelled'));
                await sendMainMenu(from);
            } else {
                await sendCourierSummary(from, user.data);
            }
            return;
        }

        // ===== TRACK STATE =====
        if (user.step === 'track') {
            const destination = locations.find(l => l.toLowerCase() === text);
            if (destination) {
                const collectionPoint = destinationCollectionPoints[destination];
                const agentInfo = agents[destination];
                const tomorrowDate = getTomorrowDate();
                
                const message = t(from, 'trackingInfo', {
                    destination: destination,
                    date: tomorrowDate,
                    collectionPoint: collectionPoint,
                    agentName: agentInfo.name,
                    whatsapp: agentInfo.whatsapp
                });
                
                await sendMessage(from, message);
                user.step = 'menu';
                await sendMainMenu(from);
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
    try {
        await axios.post(
            `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                text: { body: text }
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                },
                httpsAgent: agent
            }
        );
        console.log(`✅ [${to}] << ${text.substring(0, 40)}...`);
    } catch (error) {
        console.log("❌ Send error:", error.response?.data || error.message);
    }
}

async function sendButtons(to, bodyText, buttons) {
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
                    action: {
                        buttons: validButtons.map(b => ({
                            type: "reply",
                            reply: {
                                id: b.id,
                                title: b.title.substring(0, 20)
                            }
                        }))
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                },
                httpsAgent: agent
            }
        );
        console.log(`✅ Buttons sent to ${to}`);
    } catch (error) {
        console.log("❌ Buttons error:", error.response?.data || error.message);
    }
}

async function sendList(to, bodyText, buttonText, rows) {
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
                    action: {
                        button: buttonText,
                        sections: [{
                            title: "Select Option",
                            rows: validRows
                        }]
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                },
                httpsAgent: agent
            }
        );
        console.log(`✅ List sent to ${to}`);
    } catch (error) {
        console.log("❌ List error:", error.response?.data || error.message);
    }
}

// ===============================
// 🎯 LOCATION LIST
// ===============================

async function sendLocationList(to, prompt) {
    await sendList(to, prompt, "📋 View Locations", locationList);
}

// ===============================
// 🎯 COURIER FLOW FUNCTIONS
// ===============================

async function sendCourierSummary(to, data) {
    const pickupDetail = locationDetails[data.pickup];
    const deliveryDetail = locationDetails[data.delivery];
    const agentInfo = agents[data.delivery];
    const price = deliveryDetail.price || "$5 - $15 depending on size";
    const tomorrowDate = getTomorrowDate();
    
    const message = t(to, 'courierSummary', {
        pickup: data.pickup,
        pickupPoint: pickupDetail.dropPoint,
        pickupAddress: pickupDetail.address,
        pickupContact: pickupDetail.contact,
        pickupPhone: pickupDetail.phone,
        pickupDropTime: pickupDetail.dropTime,
        delivery: data.delivery,
        deliveryPoint: deliveryDetail.dropPoint,
        deliveryAddress: deliveryDetail.address,
        deliveryContact: deliveryDetail.contact,
        price: price,
        agentName: agentInfo.name,
        whatsapp: agentInfo.whatsapp
    });
    
    await sendMessage(to, message);
    
    await sendButtons(to, "Would you like to proceed with this courier request?", [
        { id: "confirm", title: t(to, 'confirm') },
        { id: "change", title: t(to, 'change') },
        { id: "cancel", title: t(to, 'cancel') }
    ]);
}

async function sendDestinationDetailsMessage(to, destination) {
    const details = destinationCollectionPoints[destination] || `📍 *${destination}*\nPlease contact support for details.`;
    const agentInfo = agents[destination];
    
    const message = `📍 *Destination Collection Point*\n\n${details}\n\n📞 *Agent Contact*\n👤 ${agentInfo.name}\n💬 Chat: ${agentInfo.whatsapp}`;
    
    await sendMessage(to, message);
    
    await sendButtons(to, t(to, 'newRequest'), [
        { id: "new_request", title: t(to, 'newRequest') },
        { id: "menu", title: t(to, 'backToMenu') }
    ]);
}

// ===============================
// 🎯 OTHER FUNCTIONS
// ===============================

async function sendLanguageButtons(to) {
    await sendButtons(to, t(to, 'languageSelect'), [
        { id: "lang_en", title: "🇬🇧 English" },
        { id: "lang_sn", title: "🇿🇼 Shona" },
        { id: "lang_nd", title: "🇿🇼 Ndebele" }
    ]);
}

async function sendMainMenu(to) {
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
    console.log(`🤖 Bot Mode: ${botMode ? "ON 🟢" : "OFF 🔴 (Silent Mode)"}`);
    console.log(`⏰ Session Timeout: ${SESSION_TIMEOUT / 60000} minutes`);
    console.log("====================================\n");
    console.log("📋 Admin Commands:");
    console.log("  /bot on   - Turn bot ON (automatic responses)");
    console.log("  /bot off  - Turn bot OFF (silent mode - no auto responses)");
    console.log("  /status   - Check bot status");
    console.log("  /reply [number] [message] - Reply to a customer");
    console.log("====================================\n");
    if (!botMode) {
        console.log("🔴 BOT IS IN SILENT MODE - No automatic responses will be sent");
        console.log("   All customer messages will be forwarded to admin only\n");
    }
});
