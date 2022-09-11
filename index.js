const express = require("express");
const app = express();
const readline = require("readline-sync");
const bodyParser = require("body-parser");
var qs = require("qs");
let sprintf = require("sprintf-js").sprintf;

const axios = require("axios");
const settings = require("./appSettings");
const graphHelper = require("./graphHelper");
const grapApiHelper = require("./graphAPIDictionary.json");
const { tenantId, clientId, clientSecret } = require("./appSettings");
const { query } = require("express");
const scope =
	"user.read user.read.all Mail.ReadWrite Mail.Send Contacts.ReadWrite Files.ReadWrite.All Calendars.ReadWrite";
const redirectUrl = "http://localhost:5000/checkPort/";
const accessToken =
	"EwCAA8l6BAAUkj1NuJYtTVha+Mogk+HEiPbQo04AAZVX+MTczaHBR0wYzIxEkX5i1WhTs0Na01pA3F4+1Z3Gf2Xq2MG7ic8Oz/ZgTi/NjJ3XH22G9Nd+qVNGiR9Hcdr7NEvOqeaXtMUpWYVFjDKz4vbQjEHBjA5jvCjEBK3tLBEGCJh3V75Df1iuuof9kfe7FA31/CWjWnpPWBSp2SEt41yAostP4yj7NDsyoV1NuT7LMooc2s89o6xCWXsnw8DgGBDXljCjb9so0HDlFoBvIOELuQQC3Lo3H6AtRbhjyNWeoD/wcdbNChH/NslRm+OO4CxbpKdD2YNaMIhxIO/rJ73mNOHwv73LX8FNhDAo1IO22SQricmahDxz5sye82cDZgAACIw91RNkEFo3UAJpMZISM+jcGpdrVFt3FUDJ6eULUFkmT6LHDeC1GBhGpfCjzZsztvVPkboxGNTMVX5KrSZp7g6kp2p8ztydyjwGEBrbC4rlJdWYZHGNe46ZIhVAliHGpi0OTydkgUuLLoemP0H47ImY0kPVMWntdnsBaE4L6tm7CsFdbzFDngpEWJ+TOcfDUUeICk3EHNFD5Sq7JdYE4uYXV89jiecBRLoF1hbLcYwLgEWja/SPfyLdCmuPZ68pZulfzTYJ783Rad4cWuYfk4HtAi7B3QoYg5KRFba19znMSKsnfq8WWUyGC5RpT8HX5UkgwD7oUZwIraysbUryhb58ERcrAOJA1w+LP7BF3Pcp2nq+jG8zdXnE+ix9fDeTps51Zvd7syxAbbWgNMhge8MEkUG31ihmsrj+I52iy/MmRkHL4OsPIVl8sMTSxoin6HYdNG69TR3jy49xOmfullPl3J7z/h50koqu8MVNOvgxx7yjsSnUiLT07JHMvyC9CbCJg7NSd/cO1I8OQQ8flVWxLVkyI2SccehdsDutOjEUXYUMzxZ/2Ldu4Az3XHBVBf3OiToODEZRNJO62j8glcpgL54eC454wTwhGuw3KfO+3pVOhpjj4SPOseUr2dduNzJ8XFrKSlutlWwaUAOdOnGfzDhCoVP2jSbPx6hO0ukuiCOaqvyW8XYQ3tQ8AFN1hjlUjLaC8ALaPvybzejD3nuuo4iimTBfZEdsO9g9D3mkXCTs6iCpDFj1cuWrHFCWPc4kwQ5227rzt6dsyBa9WDd4L228UEswI8CLmAI=";
const refreshToken =
	"M.R3_BAY.-Cezm3Z59xDzRT2QDhvbU3G3jMhM0zUa6Q2bhmYez*frIdUufIbWZ!Aw91DQUfvNfiyT9*J3cHY9VaRB7ApNNnkUklPgLl2CBc1chyQ*UP49!9U8oXJFdK7RYX2DbRqt0bw2q6H8VllLLP1TJ9M6SIcs!jc!3Qm9olWB8lxk1LmQD2UTT70AGeL8OgU6LwfQ5JFmCEPtw5xq7hgwcLiNsbBo5V9zyZ3rJq4P3RunKAHXon7KfsN7zvOCY7g*vBj*WOaIgONa4G9X2UWGIDWG8O79*ObSNMIV6aWpzrGgMyVX6l!*XicvMc328alnQWtHiR6!uSXeYFhjt2P9H9X6SDZ!d6nCn!0qXp9TrzyLXn6V5mFw0GuBL6v95OAsYNRT9cg$$";
const tokenType = "Bearer";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.status(200).json("working");
});

app.get("/checkPort", async (req, res) => {
	const { code, state, session_state } = req.query;
	console.log("calling net url");
	try {
		const formData = qs.stringify({
			client_id: clientId,
			scope,
			code,
			redirect_uri: redirectUrl,
			grant_type: "authorization_code",
			client_secret: clientSecret,
		});
		const axiosConfig = {
			method: "post",
			url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
			//url: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: formData,
		};
		const token = await axios(axiosConfig);
		console.log(token.data);
	} catch (error) {
		console.log(error);
	}
	res.status(200).json("working port");
});

app.get("/regenerateToken/:refreshToken", async (req, res) => {
	const { refreshToken } = req.params;
	const regenratedToken = await regenerateToken(refreshToken);
	console.log(regenratedToken);
	res.status(200);
});

app.post("/getData", async (req, res) => {
	const { callType, data } = req.body;
	const { response, error } = await getGraphData(
		callType,
		tokenType,
		accessToken,
		data
	);
	if (error) return res.status(204).json(error);
	return res.status(200).json(response);
});

const regenerateToken = async (refreshToken) => {
	try {
		const formData = qs.stringify({
			client_id: clientId,
			scope,
			refresh_token: refreshToken,
			grant_type: "refresh_token",
			client_secret: clientSecret,
		});
		const axiosConfig = {
			method: "post",
			url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: formData,
		};
		const token = await axios(axiosConfig);
		console.log(token.data);
		return token.data;
	} catch (error) {
		console.log(error);
	}
};

const getUrl = (base, params, data) => {
	const paramsValue = params.map((val) => data[val]);
	console.log(sprintf(base, ...paramsValue));
	return sprintf(base, ...paramsValue);
};

const getGraphData = async (urlType, tokenType, accessToken, data) => {
	// try {
	const url =
		"urlParamsRequired" in grapApiHelper[urlType]
			? getUrl(
					grapApiHelper[urlType]["url"],
					grapApiHelper[urlType]["urlParamsRequired"],
					data
			  )
			: grapApiHelper[urlType]["url"];
	var config = {
		method: grapApiHelper[urlType]["method"],
		url,
		headers: {
			Authorization: `${tokenType} ${accessToken}`,
		},
	};
	const response = await axios(config);
	return { error: undefined, response: response.data };
	// } catch (err) {
	// 	console.log(err.message);
	// 	return { error: err.message, response: undefined };
	// }
};

app.post("/addNewCalendar", async (req, res) => {
	try {
		const { data } = req.body;
		const urlType = "addNewCalendar";
		const postBody = {};
		if ("bodySchema" in grapApiHelper[urlType]) {
			for (const params of grapApiHelper[urlType]["bodySchema"]) {
				console.log(params);
				postBody[params["param"]] = data[params["param"]];
			}
		}
		var config = {
			method: grapApiHelper[urlType]["method"],
			url: grapApiHelper[urlType]["url"],
			data: postBody,
			headers: {
				Authorization: `${tokenType} ${accessToken}`,
				"Content-Type": "application/json",
			},
		};
		const response = await axios(config);
		res.status(200).json({ error: undefined, data: response.data });
	} catch (err) {
		console.log(err.message);
		res.status(err.statusCode).json({ error: err.message, data: undefined });
	}
});

app.post("/addNewCalendarEvent", async (req, res) => {
	// try {
	const { data, dataInUrl } = req.body;
	const urlType = "addNewCalendarEvent";
	const url =
		"urlParamsRequired" in grapApiHelper[urlType]
			? getUrl(
					grapApiHelper[urlType]["url"],
					grapApiHelper[urlType]["urlParamsRequired"],
					dataInUrl
			  )
			: grapApiHelper[urlType]["url"];
	const postBody = {};
	if ("bodySchema" in grapApiHelper[urlType]) {
		for (const params of grapApiHelper[urlType]["bodySchema"]) {
			console.log(params);
			postBody[params["param"]] = data[params["param"]];
		}
	}
	var config = {
		method: grapApiHelper[urlType]["method"],
		url,
		data: postBody,
		headers: {
			Authorization: `${tokenType} ${accessToken}`,
			"Content-Type": "application/json",
		},
	};
	const response = await axios(config);
	res.status(200).json({ error: undefined, data: response.data });
	// } catch (err) {
	// 	console.log(err.message);
	// 	res.status(err.statusCode).json({ error: err.message, data: undefined });
	// }
});

app.listen(5000, () => {
	console.log("running on 5000");
});

//https://login.microsoftonline.com/3351e985-eb38-4850-8b00-797f2b2b64f8/oauth2/v2.0/authorize?client_id=f0ced904-016e-4316-afcd-49668e847d9a&response_type=code&redirect_uri=http://localhost:5000/checkPort/&response_mode=query&scope=offline_access user.read mail.read&state=12345
