// const inspector = require('@inspector-apm/inspector-nodejs')({
//     ingestionKey: '79dfd0c3fd88a43b4ff97b8c2903679d8fe09012',
// })
const express = require('express');
const app = express();
// app.use(inspector.expressMiddleware())
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');


const fs = require("fs");
const formidable = require('formidable');
const credentials = require('./credentials.json');

const client_id = credentials.web.client_id;
const client_secret = credentials.web.client_secret;
const redirect_uris = credentials.web.redirect_uris;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// const SCOPE = ['https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file https://www.google.com/m8/feeds']
// const SCOPEGmail = ['https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.insert https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.metadata https://www.googleapis.com/auth/gmail.settings.basic https://www.googleapis.com/auth/gmail.settings.sharing']

// const SCOPE = ['https://www.googleapis.com/auth/contacts']

// const SCOPE = ['https://www.google.com/m8/feeds']

const SCOPE = ['https://mail.google.com']

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send(' API Running'));

app.get('/getAuthURL', async (req, res) => {
    console.log('çoming here')
    // const transaction = inspector.startTransaction('getAuthURL')
    console.log('coming herer')
    // req.inspector.addSegment(() => {
    //     console.log('Adding Segment')
    // }, 'testing segment')
    req.inspector.addSegment(() => {

        // Your statements here...

        return 'Hello'

    }, 'csv-export', 'testing').then(() => {
        console.log('Executoiing ')
    })
    req.inspector.addSegment(() => {

        // Your statements here...

        return 'Hello'

    }, 'csv-export', 'testing1').then(() => {
        console.log('Executoiing ')
    })
    req.inspector.addSegment(() => {

        // Your statements here...

        return 'Hello'

    }, 'csv-export', 'testing2').then(() => {
        console.log('Executoiing ')
    })
    console.log('coming herer')
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPE,
    });
    console.log(authUrl);
    // transaction.end()
    return res.send(authUrl);
});

app.post('/getToken', (req, res) => {
    if (req.body.code == null) return res.status(400).send('Invalid Request');
    oAuth2Client.getToken(req.body.code, (err, token) => {
        if (err) {
            console.error('Error retrieving access token', err);
            return res.status(400).send('Error retrieving access token');
        }
        res.send(token);
    });
});

app.post('/getUserInfo', (req, res) => {
    if (req.body.token == null) return res.status(400).send('Token not found');
    oAuth2Client.setCredentials(req.body.token);
    const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });

    oauth2.userinfo.get((err, response) => {
        if (err) res.status(400).send(err);
        console.log(response.data);
        res.send(response.data);
    })
});

app.post('/readDrive', (req, res) => {
    if (req.body.token == null) return res.status(400).send('Token not found');
    oAuth2Client.setCredentials(req.body.token);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    drive.files.list({
        pageSize: 10,
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return res.status(400).send(err);
        }
        const files = response.data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
        res.send(files);
    });
});

app.post('/fileUpload', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(400).send(err);
        const token = JSON.parse(fields.token);
        console.log(token)
        if (token == null) return res.status(400).send('Token not found');
        oAuth2Client.setCredentials(token);
        console.log(files.file);
        const drive = google.drive({ version: "v3", auth: oAuth2Client });
        const fileMetadata = {
            name: files.file.name,
        };
        const media = {
            mimeType: files.file.type,
            body: fs.createReadStream(files.file.path),
        };
        drive.files.create(
            {
                resource: fileMetadata,
                media: media,
                fields: "id",
            },
            (err, file) => {
                oAuth2Client.setCredentials(null);
                if (err) {
                    console.error(err);
                    res.status(400).send(err)
                } else {
                    res.send('Successful')
                }
            }
        );
    });
});

app.post('/deleteFile/:id', (req, res) => {
    if (req.body.token == null) return res.status(400).send('Token not found');
    oAuth2Client.setCredentials(req.body.token);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    var fileId = req.params.id;
    drive.files.delete({ 'fileId': fileId }).then((response) => { res.send(response.data) })
});

app.post('/download/:id', (req, res) => {
    if (req.body.token == null) return res.status(400).send('Token not found');
    oAuth2Client.setCredentials(req.body.token);
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    var fileId = req.params.id;
    drive.files.get({ fileId: fileId, alt: 'media' }, { responseType: 'stream' },
        function (err, response) {
            response.data
                .on('end', () => {
                    console.log('Done');
                })
                .on('error', err => {
                    console.log('Error', err);
                })
                .pipe(res);
        });

});

app.post('/getContacts', async (req, res) => {
    oAuth2Client.setCredentials(req.body.token);
    const people = google.people({ version: 'v1', auth: oAuth2Client });
    const { data: groups } = await people.people.connections.list({
        personFields: ['names', 'emailAddresses', 'phoneNumbers'],
        resourceName: 'people/me',
        pageSize: 300,
    });
    res.send(groups)
})


app.post('/cretaeContact', async (req, res) => {
    oAuth2Client.setCredentials(req.body.token);
    const people = google.people({ version: 'v1', auth: oAuth2Client });
    const { data: newContact } = await people.people.createContact({
        requestBody: {
            emailAddresses: [{ value: 'sriman@kotaru.com' }],
            names: [
                {
                    displayName: 'Sriman Kotaru',
                    familyName: 'Doe',
                    givenName: 'John',
                },
            ],
            phoneNumbers: [
                {
                    "value": "+91 96528 76646",
                    "canonicalForm": "+919652876646",
                    "type": "mobile",
                    "formattedType": "Mobile"
                }
            ]
        },
    });
    res.send(newContact)
})



app.post('/cretaeContact', async (req, res) => {
    oAuth2Client.setCredentials(req.body.token);
    const people = google.people({ version: 'v1', auth: oAuth2Client });
    const { data: newContact } = await people.people.createContact({
        requestBody: {
            emailAddresses: [{ value: 'sriman@kotaru.com' }],
            names: [
                {
                    displayName: 'Sriman Kotaru',
                    familyName: 'Doe',
                    givenName: 'John',
                },
            ],
            phoneNumbers: [
                {
                    "value": "+91 96528 76646",
                    "canonicalForm": "+919652876646",
                    "type": "mobile",
                    "formattedType": "Mobile"
                }
            ]
        },
    });
    res.send(newContact)
})



app.post('/updateContact', async (req, res) => {
    oAuth2Client.setCredentials(req.body.token);
    const people = google.people({ version: 'v1', auth: oAuth2Client });
    const { data: newContact } = await people.people.updateContact({
        resourceName: "people/c9220907275549267803",
        personFields: "phoneNumbers",
        updatePersonFields: "phoneNumbers",
        resource: {
            // Person.metadata.sources.etag
            "etag": "%EgkBAgkLLjc9Pj8aBAECBQciDGJHdG0xWDVXUUlBPQ==",
            phoneNumbers: [
                {
                    value: "+92 318 7649 354",
                    type: "home",
                },
            ],
        },
    })
    res.send(newContact)
})


app.post('/deleteContact', async (req, res) => {
    oAuth2Client.setCredentials(req.body.token);
    const people = google.people({ version: 'v1', auth: oAuth2Client });
    const { data: newContact } = await people.people.updateContact({
        resourceName: "people/c9220907275549267803",
        personFields: "phoneNumbers",
        updatePersonFields: "phoneNumbers",
        resource: {
            // Person.metadata.sources.etag
            "etag": "%EgkBAgkLLjc9Pj8aBAECBQciDGJHdG0xWDVXUUlBPQ==",
            phoneNumbers: [
                {
                    value: "+92 318 7649 354",
                    type: "home",
                },
            ],
        },
    })
    res.send(newContact)
})

const createMail = async (options) => {
    const mailComposer = new MailComposer(options);
    const message = await mailComposer.compile().build();
    return encodeMessage(message);
};
const encodeMessage = (message) => {
    return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

app.post('/sendEmail', async (req, res) => {
    oAuth2Client.setCredentials(req.body.token);
    console.log('coming herer')
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const fileAttachments = [
        {
            filename: 'attachment1.txt',
            content: 'This is a plain text file sent as an attachment',
        },
        // {
        //     // path: path.join(__dirname, './attachment2.txt'),
        // },
        {
            filename: 'websites.pdf',
            path: 'https://www.labnol.org/files/cool-websites.pdf',
        },

        // {
        //     filename: 'image.png',
        //     content: fs.createReadStream(path.join(__dirname, './attach.png')),
        // },
    ];
    const options = {
        to: 'me@karthik.bio',
        cc: ['karthik.minnikanti@transcendsoftware.com', 'udit@pipeclose.com'],
        replyTo: 'amit@labnol.org',
        subject: 'Hello Amit 🚀',
        text: 'This email is sent from the command line',
        html: `<p>🙋🏻‍♀️  &mdash; This is a <b>test email</b> from <a href="https://digitalinspiration.com">Digital Inspiration</a>.</p>`,
        // attachments: fileAttachments,
        textEncoding: 'base64',
        headers: [
            { key: 'X-Application-Developer', value: 'Amit Agarwal' },
            { key: 'X-Application-Version', value: 'v1.0.0.2' },
        ],
    };

    const rawMessage = await createMail(options);
    const data = await gmail.users.messages.send({
        userId: 'me',
        resource: {
            raw: rawMessage,
        },
    });


    res.status(200).send(data)
})

app.post('/getInboxMessages', async (req, res) => {
    oAuth2Client.setCredentials(req.body.token);
    console.log('coming herer')
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const data = await gmail.users.messages.list({ userId: 'me' })
    console.log(data)
    res.send(data)
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Started ${PORT}`)
});