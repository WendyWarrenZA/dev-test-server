const express = require('express')
const cors = require('cors');
const got = require('got'); //https://github.com/sindresorhus/got

const app = express();
const port = 5678;

app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("Dev Test Server");
});

//Get /commits?owner=test&repo=one&since=YYYY-MM-DDTHH:MM:SSZ&until=YYYY-MM-DDTHH:MM:SSZ
//since is commits after this date, unit is commits before this date
app.get('/commits', (req, res) => {
	if (req.query.owner == null || req.query.repo == null || req.query.since == null || req.query.until == null){
		res.send('No parameters, please include owner, repo, since and until');
	}
	else{
		const owner = req.query.owner;
		const repo = req.query.repo;
		const since = req.query.since;
		const until = req.query.until;
		
		let url = 'https://api.github.com/repos/'+owner+'/'+repo+'/commits?per_page=1&since='+since+'&until='+until;
		(async () => {
			try {
				const response = await got(url);							
				//res.send(response.body);
				res.send('{"interval": "week","commitCounts": {"trueadm" : 1,"bvaughn" : 4, "sjones" : 0, "fbower" : 5}}');
			} catch (error) {			
				//=> 'Internal server error ...'
				res.send('Error: ' + error);
			}
		})();
	}
});

module.exports = app;