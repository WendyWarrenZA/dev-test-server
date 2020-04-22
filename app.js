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
	if (req.query.owner == null || req.query.repo == null || req.query.since == null || req.query.until == null || req.query.interval == null){
		res.send('No parameters, please include owner, repo, since, until and interval');
	}
	else{
		const owner = req.query.owner;
		const repo = req.query.repo;
		const since = req.query.since;
		const until = req.query.until;		
		let pageIndex = 1;
		let commits = [];
		
		//Get the first page and determine if more pages need to be obtained from the github api
		let url = 'https://api.github.com/repos/'+owner+'/'+repo+'/commits?per_page=100&since='+since+'&until='+until+'&page=1';
		(async () => {						
			try {
				let response = await got(url);	
				if (response != null){
					commits = JSON.parse(response.body);						
					if (response.headers.link != null){
						let newUrl = response.headers.link.split(',')[1].split(';')[0].split('<')[1].split('>')[0];							
						pageIndex = newUrl.split('&page=')[1];						
					}
				}	
			} catch (error) {			
				//=> 'Internal server error ...'	
				console.log(error);				
			}
			//get more pages if necessary			
			if (pageIndex > 1) {	
				for (let i = 2; i <= pageIndex; i++){
					try {			
						url = 'https://api.github.com/repos/'+owner+'/'+repo+'/commits?per_page=100&since='+since+'&until='+until+'&page='+i;										
						let response = await got(url);	
						if (response != null){	
							commits.push(JSON.parse(response.body));							
						}
					} catch (error) {			
						//=> 'Internal server error ...'	
						console.log(error);				
					}			
				}
			}		
		})().then(() => {
			//process the reponse to get the commit counts per user
			try{
				var commitCounts = {}; 				
				for (let i = 0; i < commits.length; i++)
				{
					if (commits[i].author != null){									
						let commit = commits[i].author.login;        
						if (!commitCounts[commit]){
							commitCounts[commit] = 1;                        
						} else {
							commitCounts[commit] += 1;
						}
					}					
				}
				
				res.send({"interval": req.query.interval,"commitCounts": commitCounts});
			} catch (error) {			
				//=> 'Internal server error ...'	
				console.log(error);						
				res.send('Error: ' + error);
			}
		});		
	}
});

module.exports = app;