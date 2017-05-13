
/*
 * GET home page.
 */
var fs = require('fs');
	var readline = require('readline');
	var google = require('googleapis');
	var googleAuth = require('google-auth-library');

exports.index = function(req, res){	
	// If modifying these scopes, delete your previously saved credentials
	// at ~/.credentials/gmail-nodejs-quickstart.json
	var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
	var TOKEN_DIR = '';
	var TOKEN_PATH = './abb.json';

	// Load client secrets from a local file.
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
	  if (err) {
	    console.log('Error loading client secret file: ' + err);
	    return;
	  }
	  // Authorize a client with the loaded credentials, then call the
	  // Gmail API.
	  authorize(JSON.parse(content), listLabels);
	});

	/**
	 * Create an OAuth2 client with the given credentials, and then execute the
	 * given callback function.
	 *
	 * @param {Object} credentials The authorization client credentials.
	 * @param {function} callback The callback to call with the authorized client.
	 */
	function authorize(credentials, callback) {
	  var clientSecret = credentials.installed.client_secret;
	  var clientId = credentials.installed.client_id;
	  var redirectUrl = credentials.installed.redirect_uris[0];
	  var auth = new googleAuth();
	  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	  // Check if we have previously stored a token.
	  fs.readFile(TOKEN_PATH, function(err, token) {
	    if (err) {
	      getNewToken(oauth2Client, callback);
	    } else {
	      oauth2Client.credentials = JSON.parse(token);
	      callback(oauth2Client);
	    }
	  });
	}

	/**
	 * Get and store new token after prompting for user authorization, and then
	 * execute the given callback with the authorized OAuth2 client.
	 *
	 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
	 * @param {getEventsCallback} callback The callback to call with the authorized
	 *     client.
	 */
	function getNewToken(oauth2Client, callback) {
	  var authUrl = oauth2Client.generateAuthUrl({
	    access_type: 'offline',
	    scope: SCOPES
	  });
	  console.log('Authorize this app by visiting this url: ', authUrl);
	  var rl = readline.createInterface({
	    input: process.stdin,
	    output: process.stdout
	  });
	  rl.question('Enter the code from that page here: ', function(code) {
	    rl.close();
	    oauth2Client.getToken(code, function(err, token) {
	      if (err) {
	        console.log('Error while trying to retrieve access token', err);
	        return;
	      }
	      oauth2Client.credentials = token;
	      storeToken(token);
	      callback(oauth2Client);
	    });
	  });
	}

	/**
	 * Store token to disk be used in later program executions.
	 *
	 * @param {Object} token The token to store to disk.
	 */
	function storeToken(token) {
	  /*try {
	    fs.mkdirSync(TOKEN_DIR);
	  } catch (err) {
	    if (err.code != 'EEXIST') {
	      throw err;
	    }
	  }*/
	  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
	  console.log('Token stored to ' + TOKEN_PATH);
	}

	/**
	 * Lists the labels in the user's account.
	 *
	 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
	 */
	
	function getMessage(auth, messageId) {
		var gmail = google.gmail('v1');
		  gmail.users.messages.get({
			  auth: auth,
			  'userId': 'me',
		    'id': messageId
		  }, function(err, response){
			  if (err) {
			      console.log('The API returned an error: ' + err);
			      return;
			    }  
			  else{
			  console.log(response.payload);
			  //Lables
			  /*if (p.MimeType == "text/html")
              {
                  try
                  {
                      byte[] data = Convert.FromBase64String(p.Body.Data);
                      string decodedString = Encoding.UTF8.GetString(data);
                      Response.Write(decodedString);
                  }
                  catch (Exception ex) { }
              }*/
			  
			  //Snippet
			  console.log("Snippet: "+response.snippet);
			  //console.log("Object 0: "+JSON.stringify(response.payload.headers[0]));
			  for(var i=0;i<(response.payload.headers).length;i++){
				  console.log(" obj: "+JSON.stringify(response.payload.headers[i]));
			  }
			  //console.log("Received from "+JSON.stringify(response.payload.headers[12].value));
			  //console.log(new Buffer(response.payload.parts, 'base64').toString());
			  console.log("-----------------------------"+JSON.stringify(response.payload));
			 //console.log("Payload: "+JSON.stringify(response.payload.parts[0].body.data));
			 var resp = null;
			 var subject = null;
			 var googleLabel = null;
			 console.log("Labels: "+JSON.stringify(response));
			 if (response.labelIds.indexOf("IMPORTANT")>0){
				 googleLabel  = "important";
			 }
			 for (var i=0; i<response.payload.headers.length; i++)
             {   
                 if (response.payload.headers[i].name =="From")
                     {   var sender= response.payload.headers[i].value;
                         var s=sender.substr(0, sender.indexOf('<')-1); 
                         if (s)
                         {   
                        	 resp = s;
                             console.log(s);
                         }
                         else
                        	 
                         {   
                        	 resp = "Unknown Sender";
                        	 console.log("Unknown Sender");}
                     }
                 if(response.payload.headers[i].name =="Subject"){
                	 
                	 if(response.payload.headers[i].value != ""){
                		 subject = response.payload.headers[i].value;
                	 }
                	 else{
                		 subject = "This mail doesn't have a subject";
                	 }
                 }
             }
			 //Classify here
			 //http://ec2-54-173-121-109.compute-1.amazonaws.com:5000
			 var request = require('request');
			 request('http://ec2-54-173-121-109.compute-1.amazonaws.com:5000/?sentence='+response.snippet, function (error, response, body) {
			   console.log('error:', error); // Print the error if one occurred 
			   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
			   console.log('body:', body); // Print the HTML for the Google homepage. 
			   res.send({"mailFrom ": resp, "subject": subject, "googleLabel" : googleLabel, "messageSnippet": response.snippet, "classifiedInto": body  });
			 });
			 
			 //res.render('index', { title: 'Express' });  	
			  }
		  });
		  
		}
	
	function listLabels(auth) {
	  var gmail = google.gmail('v1');
	  gmail.users.messages.list({
	    auth: auth,
	    userId: 'me',
	    maxResults: '1',
	  }, function(err, response) {
	    if (err) {
	      console.log('The API returned an error: ' + err);
	      return;
	    }
	    /*var labels = response.labels;
	    if (labels.length == 0) {
	      console.log('No labels found.');
	    } else {
	      console.log('Labels:');
	      for (var i = 0; i < labels.length; i++) {
	        var label = labels[i];
	        console.log('- %s', label.name);
	        res.render('index', { title: 'Express' });
	      }
	    }*/
	    else{
	    	console.log(response.messages[0].id);
	    	var resid = response.messages[0].id;
	    	getMessage(auth,resid);
	    	
	    }
	  });
	}
	
	
};