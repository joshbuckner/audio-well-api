const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const concat = require('concat-stream');
const fs = require('file-system');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
app.use('/public', express.static(__dirname + '/public'));

const db = {
	users: [
		{
			id: '1',
			name: 'John',
			email: 'john@gmail.com',
			password: 'cookies',
			joined: new Date(),
			songs: []
		},
		{
			id: '2',
			name: 'Kate',
			email: 'kate@gmail.com',
			password: 'dogs',
			joined: new Date(),
			songs: []
		}
	]
}

app.get('/', (req, res) => {
	res.send(db.users);
});

app.post('/signin', (req, res) => {
	for (let i=0; i < db.users.length; i++) {
		if (req.body.email === db.users[i].email && req.body.password === db.users[i].password) {
			return res.json(db.users[i]);
		}
	}
	res.status(400).json('error logging in');
});

app.post('/register', (req, res) => {
	const { name, email, password } = req.body;
	db.users.push({
		id: '3',
		name: name,
		email: email,
		password: password,
		joined: new Date(),
		songs: []
	});
	res.json(db.users[db.users.length-1]);
});

app.post('/addsong', (req, res) => {
	for (let i = 0; i < db.users.length; i++) {
		if (db.users[i].email === req.body.user) {
			db.users[i].songs.push({
				id: '1',
				name: req.body.name,
				path: `${__dirname}/public/files/${req.body.name}`,
				owner: req.body.user,
				notes: [
					{
						title: 'start',
						color: 'vivid-tangerine',
						time: '0:00',
					}
				]
			});
			// console.log(db.users[i].songs)
			res.status(200).json(db.users[i]);
		}
	}
});

app.post('/addnote', (req, res) => {
	for (let i = 0; i < db.users.length; i++) {
		if (db.users[i].email === req.body.user) {
			for (let z = 0; z < db.users[i].songs.length; z++) {
				if (db.users[i].songs[z].name === req.body.song) {
					db.users[i].songs[z].notes.push({
		      	title: req.body.note.title, 
		      	time: req.body.note.time, 
		      	color: req.body.note.color
					});
					console.log(db.users[i].songs)
					res.status(200).json(db.users[i]);
				}
			}
		}
	}
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	let found = false;
	db.users.forEach(user => {
		if (user.id === id) {
			found = true;
			return res.json(user);
		}
	});
	if (!found) {
		res.status(404).json('not found');
	}
});

app.post('/upload', (req, res) => {
	const uploadFile = req.files.file;
	const fileName = req.files.file.name;
	const filePath = `${__dirname}/public/files/${fileName}`;
	uploadFile.mv(filePath,
		function (err) {
			if (err) {
				return res.status(500).send(err);
			}
			// res.json({
			// 	file: `public/${req.files.file.name}`
			// });
			res.send(`${__dirname}/public/files/${fileName}`);
		}
	);

	// const { id } = req.body;
	// let found = false;
	// db.users.forEach(user => {
	// 	if (user.id === id) {
	// 		found = true;
	// 		//song upload server logic goes here
	// 		user.songs.push({
	// 			id: '2',
	// 			name: 'test song name',
	// 			notes: [],
	// 			members: []
	// 		});
	// 		return res.json(user.songs);
	// 	}
	// });
	// if (!found) {
	// 	res.status(400).json('not found');
	// }
});

//disable body-parser and read plain text requests
app.use(function(req, res, next){
  req.pipe(concat(function(data){
    req.body = data;
    next();
  }));
});

app.delete('/upload', (req, res) => {
	fs.unlink(req.body.toString('utf8'), (err) => {
		if(err) {
			res.send(err);
		}
	});
});



app.listen(3000, () => {
	console.log('api is running on port 3000');
});

/* 

/ 								GET  	--> res = this is working
/signin 					POST 	--> res = success / fail
/register 				POST 	--> res = user
/profile/:userID 	GET 	--> res = user
/upload						POST 	--> res = user
/note							POST 	--> res = user

*/