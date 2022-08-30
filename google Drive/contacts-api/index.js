const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

const people = google.people('v1');

async function runSample() {
    // Obtain user credentials to use for the request
    const auth = await authenticate({
        keyfilePath: path.join(__dirname, '../credentials.json'),
        scopes: ['https://www.googleapis.com/auth/feed'],
    });
    google.options({ auth });

    // List all user's contact groups
    // https://developers.google.com/people/api/rest/v1/contactGroups
    const { data: groups } = await people.people.get({
        resourceName: 'contactGroups',
    });
    console.log('Contact Groups:\n', groups);

    // List all user connections / contacts
    // https://developers.google.com/people/api/rest/v1/people.connections
    const {
        data: { connections },
    } = await people.people.connections.list({
        personFields: ['names', 'emailAddresses'],
        resourceName: 'people/me',
        pageSize: 10,
    });
    console.log("\n\nUser's Connections:\n");
    connections.forEach(c => console.log(c));

    // Create a new contact
    // https://developers.google.com/people/api/rest/v1/people/createContact
    const { data: newContact } = await people.people.createContact({
        requestBody: {
            emailAddresses: [{ value: 'john@doe.com' }],
            names: [
                {
                    displayName: 'John Doe',
                    familyName: 'Doe',
                    givenName: 'John',
                },
            ],
        },
    });
    console.log('\n\nCreated Contact:', newContact);
}

runSample()
module.exports = runSample;