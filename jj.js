async function main() {
	console.log("JavaScript Graph Tutorial");

	let choice = 0;

	// Initialize Graph
	initializeGraph(settings);

	// Greet the user by name
	await greetUserAsync();

	const choices = [
		"Display access token",
		"List my inbox",
		"Send mail",
		"List users (requires app-only)",
		"Make a Graph call",
	];

	while (choice != -1) {
		choice = readline.keyInSelect(choices, "Select an option", {
			cancel: "Exit",
		});

		switch (choice) {
			case -1:
				// Exit
				console.log("Goodbye...");
				break;
			case 0:
				// Display access token
				await displayAccessTokenAsync();
				break;
			case 1:
				// List emails from user's inbox
				await listInboxAsync();
				break;
			case 2:
				// Send an email message
				await sendMailAsync();
				break;
			case 3:
				// List users
				await listUsersAsync();
				break;
			case 4:
				// Run any Graph code
				await makeGraphCallAsync();
				break;
			default:
				console.log("Invalid choice! Please try again.");
		}
	}
}

function initializeGraph(settings) {
	graphHelper.initializeGraphForUserAuth(settings, (info) => {
		// Display the device code message to
		// the user. This tells them
		// where to go to sign in and provides the
		// code to use.
		console.log(info.message);
	});
}

async function greetUserAsync() {
	try {
		const user = await graphHelper.getUserAsync();
		console.log(`Hello, ${user?.displayName}!`);
		// For Work/school accounts, email is in mail property
		// Personal accounts, email is in userPrincipalName
		console.log(`Email: ${user?.mail ?? user?.userPrincipalName ?? ""}`);
	} catch (err) {
		console.log(`Error getting user: ${err}`);
	}
}

async function displayAccessTokenAsync() {
	try {
		const userToken = await graphHelper.getUserTokenAsync();
		console.log(`User token: ${userToken}`);
	} catch (err) {
		console.log(`Error getting user access token: ${err}`);
	}
}

async function listInboxAsync() {
	try {
		const messagePage = await graphHelper.getInboxAsync();
		const messages = messagePage.value;

		// Output each message's details
		for (const message of messages) {
			console.log(`Message: ${message.subject ?? "NO SUBJECT"}`);
			console.log(`  From: ${message.from?.emailAddress?.name ?? "UNKNOWN"}`);
			console.log(`  Status: ${message.isRead ? "Read" : "Unread"}`);
			console.log(`  Received: ${message.receivedDateTime}`);
		}

		// If @odata.nextLink is not undefined, there are more messages
		// available on the server
		const moreAvailable = messagePage["@odata.nextLink"] != undefined;
		console.log(`\nMore messages available? ${moreAvailable}`);
	} catch (err) {
		console.log(`Error getting user's inbox: ${err}`);
	}
}

async function sendMailAsync() {
	// TODO
}

async function listUsersAsync() {
	try {
		const userPage = await graphHelper.getUsersAsync();
		const users = userPage.value;

		// Output each user's details
		for (const user of users) {
			console.log(`User: ${user.displayName ?? "NO NAME"}`);
			console.log(`  ID: ${user.id}`);
			console.log(`  Email: ${user.mail ?? "NO EMAIL"}`);
		}

		// If @odata.nextLink is not undefined, there are more users
		// available on the server
		const moreAvailable = userPage["@odata.nextLink"] != undefined;
		console.log(`\nMore users available? ${moreAvailable}`);
	} catch (err) {
		console.log(`Error getting users: ${err}`);
	}
}

async function makeGraphCallAsync() {
	// TODO
}
