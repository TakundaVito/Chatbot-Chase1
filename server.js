const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();
app.use(bodyParser.json());

// ===============================
// 🔑 CONFIGURATION
// ===============================
const TOKEN = "EAAM57Ve9x3oBQ9UTUbWzqcis9NwkqL0etmfEwFQGovQXG3M5a3yvuz29CIN1Lai0fPTp2ZCU6WHxqpImy3vNwrDspQXwtILvG5XgpNMmpQForKqExHWxMhC5HA6LhKqlRFKyfjc9cRaSpkZAAvTxeYtqh6DRwMZC6ZCjTZABpOMpQMuEhdZC9oKEIaPAQDffW7NYENhYfKC0i0ZAtNUBXgx4jmpVoZCplklw0ZCeBLvtkjBbQnI8BI9255MxiHvT7v5A8OtmypdKD3mjVgl2DKsPTWS4h";
const PHONE_NUMBER_ID = "1047943131730645";
const VERIFY_TOKEN = "chase123";

const agent = new https.Agent({ family: 4 });

// ===============================
// 📚 DATA - COMPLETE BIKE PRICES
// ===============================
const destinations = [
    { id: "Bulawayo", title: "Bulawayo" },
    { id: "Gweru", title: "Gweru" },
    { id: "Chegutu", title: "Chegutu" },
    { id: "Kadoma", title: "Kadoma" },
    { id: "Kwekwe", title: "Kwekwe" },
    { id: "Norton", title: "Norton" }
];

const destinationDetails = {
    'Bulawayo': '📍 *BULAWAYO*\n🏢 MAIN STREET PLAZA\n📮 Main Street between 11th & 12th Avenue\n🛒 Shop 14\n👤 Ask for PAMELA\n📞 +263 77 501 8137\n🕒 Mon–Sat 8:30AM–3PM, Sun 9AM–11AM\n⚠️ Storage fee: $2 if not collected within 36hrs',
    'Gweru': '📍 *GWERU*\n🏢 TOPSY TIM MALL\n📮 Along 6th Street, opposite BETHEL CLINIC\n🛒 Shop 10\n📞 0781178955\n🕒 Mon–Sat 8AM–7PM, Sun 1:30PM–7PM',
    'Chegutu': '📍 *CHEGUTU*\n🏢 Engen Garage\n🚚 Vehicle: Blue/Green Nissan NV200 - AGD 5038\n🕒 Drop Time: 15:00 – 15:30',
    'Kadoma': '📍 *KADOMA*\n🏢 Waverly Bus stop\n🚚 Vehicle: Blue/Green Nissan NV200 - AGD 5038\n🕒 Drop Time: 16:00 – 16:30',
    'Kwekwe': '📍 *KWEKWE*\n🏢 Eat n Lick TOTAL GARAGE\n🚚 Vehicle: Blue/Green Nissan NV200 - AGD 5038\n🕒 Drop Time: 17:00 – 17:30',
    'Norton': '📍 *NORTON*\n🏢 Karina\n🚚 Vehicle: Blue/Green Nissan NV200 - AGD 5038\n🕒 Drop Time: 14:14 – 14:30'
};

const agents = {
    'Harare': { name: 'Harare Agent', number: '263785168309' },
    'Bulawayo': { name: 'Bulawayo Agent', number: '263775018137' },
    'Gweru': { name: 'Gweru Agent', number: '0781178955' }
};

// Complete bike prices from your web app
const bikePrices = {
    // Zone 1: $3
    "cbd": "$3", "avenue": "$3", "belvedere": "$5", 
    // Zone 2: $5
    "milton park": "$5", "avondale": "$5", "belgravia": "$5", 
    "newlands": "$5", "eastlea": "$5", "hillside": "$5", 
    "arcadia": "$5", "graniteside": "$5", "mbare": "$5",
    "alex park": "$5",
    // Zone 3: $7
    "warren park": "$7", "aspindale": "$7", "donview park": "$7",
    "tynwald": "$7", "madokero": "$7", "bloomingdale": "$7",
    "malbereign": "$7", "westgate": "$7", "bluffhill": "$7",
    "malborough": "$7", "greencroft": "$7", "mount pleasant": "$7",
    "mount pleasant heights": "$7", "borrowdale": "$7", "chisipiti": "$7",
    "highlands": "$7", "kamfinsa": "$7", "greendale": "$7",
    "msasa": "$7", "msasa park": "$7", "hatfield": "$7",
    "chadcombe": "$7", "waterfalls": "$7", "houghton park": "$7",
    "southerton": "$7",
    // Zone 4: $8
    "highglen": "$8", "greystone park": "$8", "arlington": "$8",
    // Zone 5: $10
    "mandara": "$10", "glen lorne": "$10", "mabvuku": "$10"
};

// Main menu options
const mainMenu = [
    { id: "about", title: "ℹ️ About Us" },
    { id: "track", title: "📦 Track Parcel" },
    { id: "intercity", title: "🚚 Intercity Courier" },
    { id: "bike", title: "🏍️ Bike Delivery" },
    { id: "taxi", title: "🚖 Taxi to Gweru" },
    { id: "price", title: "💰 Price List" },
    { id: "location", title: "📍 Office Location" },
    { id: "agent", title: "👤 Speak to Agent" }
];

// ===============================
// 🧠 USER STATE
// ===============================
let users = {};

function normalize(text) {
    return text ? text.toString().toLowerCase().trim() : '';
}

function findBikePrice(area) {
    const norm = normalize(area);
    
    // Direct match
    if (bikePrices[norm]) {
        return bikePrices[norm];
    }
    
    // Check if it's a known suburb with different spelling
    const knownSuburbs = {
        "chisipiti": "$7", "chisipite": "$7",
        "borrowdale": "$7", "borowdale": "$7",
        "avondale": "$5", "avondales": "$5",
        "hatfield": "$7", "hatfield": "$7",
        "waterfalls": "$7", "waterfall": "$7",
        "mount pleasant": "$7", "mt pleasant": "$7", "mtp": "$7",
        "eastlea": "$5", "east lea": "$5",
        "newlands": "$5", "new land": "$5",
        "belvedere": "$5", "belvadere": "$5",
        "milton park": "$5", "miltonpark": "$5",
        "graniteside": "$5", "granite side": "$5"
    };
    
    return knownSuburbs[norm] || null;
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
    // Always respond with 200 immediately
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

        // Initialize user
        if (!users[from]) {
            users[from] = {
                step: 'welcome',
                language: 'en',
                data: {}
            };
        }

        const user = users[from];

        // GLOBAL COMMANDS - Can be used ANYTIME
        if (text === 'menu' || text === 'main menu' || text === 'back') {
            user.step = 'menu';
            await sendMessage(from, "Returning to main menu...");
            await sendMainMenu(from);
            return;
        }

        if (text === 'help') {
            await sendMessage(from, "Available commands:\n• menu - Return to main menu\n• back - Go back\n• help - Show this message");
            return;
        }

        // ===== WELCOME STATE =====
        if (user.step === 'welcome') {
            if (['hi', 'hello', 'hey', 'start', 'help'].includes(text)) {
                user.step = 'language';
                await sendLanguageButtons(from);
            } else {
                await sendMessage(from, "👋 Hello! I'm chase the transporter. Type 'Hi' to begin.");
            }
            return;
        }

        // ===== LANGUAGE STATE =====
        if (user.step === 'language') {
            if (['lang_en', 'lang_sn', 'lang_nd'].includes(text)) {
                user.language = text.split('_')[1];
                user.step = 'menu';
                await sendMessage(from, "How can we assist you today?");
                await sendMainMenu(from);
            } else {
                await sendLanguageButtons(from);
            }
            return;
        }

        // ===== MENU STATE =====
        if (user.step === 'menu') {
            // Handle menu selections
            switch(text) {
                case 'about':
                    await sendMessage(from, "Chase the transporter is a trusted courier service operating along the Harare–Bulawayo route and within Harare via bike delivery.");
                    await sendMainMenu(from);
                    break;
                    
                case 'track':
                    user.step = 'track';
                    user.data.page = 1;
                    await sendTrackOptions(from, 1);
                    break;
                    
                case 'intercity':
                    user.step = 'intercity';
                    user.data.page = 1;
                    await sendIntercityOptions(from, 1);
                    break;
                    
                case 'bike':
                    user.step = 'bike';
                    await sendMessage(from, "🏍️ *Bike Delivery (Harare only)*\n\nCollection starts at 9am, cut-off time 1pm.\n\nPlease enter your suburb/area (e.g., Avondale, Borrowdale, CBD):");
                    break;
                    
                case 'taxi':
                    user.step = 'taxi';
                    await sendMessage(from, "🚖 *Taxi to Gweru*\n\nPrice: $10 per person (excluding luggage).\nHow many people? (1-9)");
                    break;
                    
                case 'price':
                    await sendMessage(from, "💰 *Price List*\n\n• Small parcel (<5kg): $5\n• Phone/Laptop: $10\n• Bike delivery: varies by zone ($3-$10)\n\nType 'bike' to check your area price.");
                    await sendMainMenu(from);
                    break;
                    
                case 'location':
                    await sendMessage(from, "📍 *Our Offices*\n\n*BULAWAYO*\nMAIN STREET PLAZA, Shop 14\nAsk for PAMELA\n📞 +263 77 501 8137\n\n*GWERU*\nTOPSY TIM MALL, Shop 10\n📞 0781178955");
                    await sendMainMenu(from);
                    break;
                    
                case 'agent':
                    user.step = 'agent';
                    await sendAgentOptions(from);
                    break;
                    
                default:
                    await sendMainMenu(from);
            }
            return;
        }

        // ===== TRACK STATE =====
        if (user.step === 'track') {
            if (text === 'next') {
                user.data.page = 2;
                await sendTrackOptions(from, 2);
                return;
            }
            
            if (text === 'prev') {
                user.data.page = 1;
                await sendTrackOptions(from, 1);
                return;
            }
            
            // Find destination (case insensitive)
            const dest = destinations.find(d => 
                d.id.toLowerCase() === text || 
                d.title.toLowerCase() === text
            );
            
            if (dest) {
                await sendMessage(from, destinationDetails[dest.id]);
                user.step = 'menu';
                await sendMainMenu(from);
            } else {
                await sendMessage(from, "❌ Please select a valid destination from the buttons.");
                await sendTrackOptions(from, user.data.page || 1);
            }
            return;
        }

        // ===== INTERCITY STATE =====
        if (user.step === 'intercity') {
            if (text === 'next') {
                user.data.page = 2;
                await sendIntercityOptions(from, 2);
                return;
            }
            
            if (text === 'prev') {
                user.data.page = 1;
                await sendIntercityOptions(from, 1);
                return;
            }
            
            const dest = destinations.find(d => 
                d.id.toLowerCase() === text || 
                d.title.toLowerCase() === text
            );
            
            if (dest) {
                await sendMessage(from, `📍 *${dest.id}*\n📦 Your parcel will be delivered tomorrow morning.\n📍 Drop point: ${destinationDetails[dest.id].split('\n')[1]}\n⚠️ Storage fee: $2 after 36hrs`);
                user.step = 'menu';
                await sendMainMenu(from);
            } else {
                await sendMessage(from, "❌ Please select a valid destination.");
                await sendIntercityOptions(from, user.data.page || 1);
            }
            return;
        }

        // ===== BIKE STATE =====
        if (user.step === 'bike') {
            // Check if user wants to exit bike flow
            if (text === 'menu' || text === 'back' || text === 'cancel') {
                user.step = 'menu';
                await sendMainMenu(from);
                return;
            }
            
            // Check if user wants to go to another menu option
            if (text === 'track' || text === 'intercity' || text === 'taxi' || text === 'price' || text === 'location' || text === 'agent') {
                user.step = 'menu';
                // Recursively handle the menu option
                await handleMenuCommand(from, text, user);
                return;
            }
            
            const price = findBikePrice(text);
            if (price) {
                await sendMessage(from, `✅ Delivery to *${originalText}* costs ${price}`);
                await sendMessage(from, "To book, reply with your name and phone number.\nOr type 'agent' to speak to an agent.\nType 'menu' to return to main menu.");
                user.step = 'bike_booking';
                user.data.area = originalText;
                user.data.price = price;
            } else {
                await sendMessage(from, `❌ No price found for "${originalText}".\n\nTry these common suburbs:\n• CBD, Avenue ($3)\n• Avondale, Borrowdale, Hatfield ($5-$7)\n• Mandara, Mabvuku ($10)\n\nType 'menu' to return to main menu.`);
            }
            return;
        }

        // ===== BIKE BOOKING STATE =====
        if (user.step === 'bike_booking') {
            if (text === 'menu' || text === 'back' || text === 'cancel') {
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
            if (text === 'menu' || text === 'back' || text === 'cancel') {
                user.step = 'menu';
                await sendMainMenu(from);
                return;
            }
            
            const num = parseInt(text);
            if (!isNaN(num) && num > 0 && num < 10) {
                await sendMessage(from, `✅ Taxi booked for ${num} people. Total: $${num * 10}`);
                await sendMessage(from, "An agent will contact you to confirm.");
                user.step = 'menu';
                await sendMainMenu(from);
            } else {
                await sendMessage(from, "❌ Please enter a valid number of people (1-9).");
            }
            return;
        }

        // ===== AGENT STATE =====
        if (user.step === 'agent') {
            if (text === 'menu' || text === 'back') {
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
                await sendMessage(from, "❌ Please select a valid location.");
                await sendAgentOptions(from);
            }
            return;
        }

        // If we get here, something went wrong - go to menu
        user.step = 'menu';
        await sendMainMenu(from);

    } catch (err) {
        console.error("❌ ERROR:", err);
    }
});

// Helper function to handle menu commands
async function handleMenuCommand(from, command, user) {
    switch(command) {
        case 'track':
            user.step = 'track';
            user.data.page = 1;
            await sendTrackOptions(from, 1);
            break;
        case 'intercity':
            user.step = 'intercity';
            user.data.page = 1;
            await sendIntercityOptions(from, 1);
            break;
        case 'taxi':
            user.step = 'taxi';
            await sendMessage(from, "🚖 How many people? (1-9)");
            break;
        case 'price':
            await sendMessage(from, "💰 *Price List*\n\n• Small parcel (<5kg): $5\n• Phone/Laptop: $10\n• Bike delivery: varies by zone");
            await sendMainMenu(from);
            break;
        case 'location':
            await sendMessage(from, "📍 *BULAWAYO*\nMAIN STREET PLAZA, Shop 14\n\n📍 *GWERU*\nTOPSY TIM MALL, Shop 10");
            await sendMainMenu(from);
            break;
        case 'agent':
            user.step = 'agent';
            await sendAgentOptions(from);
            break;
    }
}

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
        // Ensure buttons have title property
        const validButtons = buttons.filter(b => b && b.id && b.title);
        
        // WhatsApp only allows 3 buttons max
        if (validButtons.length > 3) {
            validButtons.length = 3;
        }
        
        if (validButtons.length === 0) {
            console.log("⚠️ No valid buttons to send");
            return;
        }
        
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
        // Ensure rows have title property
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
                            title: "Options",
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
// 🎯 BOT ACTIONS
// ===============================

async function sendLanguageButtons(to) {
    await sendButtons(to, "Select your language:", [
        { id: "lang_en", title: "🇬🇧 English" },
        { id: "lang_sn", title: "🇿🇼 Shona" },
        { id: "lang_nd", title: "🇿🇼 Ndebele" }
    ]);
}

async function sendMainMenu(to) {
    await sendList(to, "How can we assist you?", "View Menu", mainMenu);
}

async function sendTrackOptions(to, page) {
    if (page === 1) {
        await sendButtons(to, "Select destination:", [
            destinations[0],
            destinations[1],
            destinations[2],
            { id: "next", title: "➡️ More" }
        ]);
    } else {
        await sendButtons(to, "Select destination:", [
            destinations[3],
            destinations[4],
            destinations[5],
            { id: "prev", title: "⬅️ Back" }
        ]);
    }
}

async function sendIntercityOptions(to, page) {
    if (page === 1) {
        await sendButtons(to, "Select destination for intercity:", [
            destinations[0],
            destinations[1],
            destinations[2],
            { id: "next", title: "➡️ More" }
        ]);
    } else {
        await sendButtons(to, "Select destination for intercity:", [
            destinations[3],
            destinations[4],
            destinations[5],
            { id: "prev", title: "⬅️ Back" }
        ]);
    }
}

async function sendAgentOptions(to) {
    await sendButtons(to, "Select your location:", [
        { id: "Harare", title: "Harare" },
        { id: "Bulawayo", title: "Bulawayo" },
        { id: "Gweru", title: "Gweru" }
    ]);
}

async function sendAgentContact(to, location) {
    const agent = agents[location];
    await sendMessage(to, `👤 *${agent.name}*\n📞 ${agent.number}\n\nClick to chat: https://wa.me/${agent.number}`);
}

// ===============================
// 🚀 START SERVER
// ===============================
const PORT = 4000;
app.listen(PORT, () => {
    console.log("\n🚀 Chase The Transporter Bot");
    console.log("============================");
    console.log(`📱 Port: ${PORT}`);
    console.log(`🔑 Token: ${TOKEN.substring(0, 15)}...`);
    console.log("============================\n");
});