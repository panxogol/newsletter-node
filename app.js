const express = require("express");
const bodyParser = require("body-parser");
const mailchimp = require("@mailchimp/mailchimp_marketing");

// GLOBAL

const app = express();
const port = process.env.PORT;
const key = process.env.mailchimpKey;
const list = process.env.mailchimpList;
const server = process.env.mailchimpServer;


// APP CONFIGS
app.use(express.static(__dirname + "/static"));
app.use(bodyParser.urlencoded({ extended: true }));

// MAILCHIMP CONFIGS
mailchimp.setConfig({
    apiKey: key || "bd5b39b768b0c19749d58377132d7e00-us17",
    server: server || "us17",
});

const listId = list || "e7df3b715c";

// -- TEST MAILCHIMP
async function run() {
    const response = await mailchimp.ping.get();
    console.log(response);
};

run();

// iF EVERYTHINGS IS RUNNING OK, THEN THE RESPONSE SHOULD BE:
// {
//     "health_status": "Everything's Chimpy!"
// }

// MAILCHIMP LIST
const newsLetter = {
    name: "JFmartinez Newsletter",
};


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
    console.log(`App running on port ${port}`);
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

    res.sendFile(__dirname + "/static/html/failure.html")
};