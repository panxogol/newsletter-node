const express = require("express");
const bodyParser = require("body-parser");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const dotenv = require("dotenv");


// GLOBAL

const app = express();

// --- ENVIRONMENT ---
dotenv.config();
const port = process.env.PORT;
const key = process.env.MAILCHIMPKEY;
const list = process.env.MAILCHIMPLIST;
const server = process.env.MAILCHIMPSERVER;

// APP CONFIGS
app.use(express.static(__dirname + "/static"));
app.use(bodyParser.urlencoded({ extended: true }));

// MAILCHIMP CONFIGS
mailchimp.setConfig({
    apiKey: key,
    server: server,
});

const listId = list;

// -- TEST MAILCHIMP
async function testMailchimp() {
    const response = await mailchimp.ping.get();
    console.log(response);
};

testMailchimp();

// iF EVERYTHINGS IS RUNNING OK, THEN THE RESPONSE SHOULD BE:
// { "health_status": "Everything's Chimpy!" }


// --- PAGES ---

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/static/html/signup.html");
});


// --- POSTS ---

app.post("/", (req, res) => {
    let name = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;

    let userData = {
        firstName: name,
        lastName: lastName,
        email: email,
    };

    subscribeUser(userData, res).catch((e) => {
        console.log(e);
        res.sendFile(__dirname + "/static/html/failure.html");
    });
});


// --- LOGS ---

app.listen(port || 3000, (req, res) => {
    console.log(`App running on port ${port || 3000}`);
});



// --- FUNCTIONS ---
async function subscribeUser(subscribingUser, res) {
    const response = await mailchimp.lists.addListMember(listId, {
        email_address: subscribingUser.email,
        status: "subscribed",
        merge_fields: {
            FNAME: subscribingUser.firstName,
            LNAME: subscribingUser.lastName,
        },
    });

    console.log(
        `Successfully added contact as an audience member. The contact's id is ${response.id}.`
    );

    res.sendFile(__dirname + "/static/html/succes.html")
};