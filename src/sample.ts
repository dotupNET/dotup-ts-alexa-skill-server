import { SkillServer } from "./SkillServer";

var server = new SkillServer(44303);

server.configure(config => {
	config.RootPath = __dirname;
	config.SslPath = '../secrets/certs';
	config.SslPrivateKey = 'privkey1.pem';
	config.SslCertificate = 'cert1.pem';
	config.SslChain = 'chain1.pem';
});

process.env.useCallStack = "true";


// Add a skill by it's name
//server.addSkill('ige-skill');

// Add a skill from package.json file. the following line overrides the previous regsitration

server.addSkillFromPackage('custom');
// server.addSkillFromPackage('ige-skill');

// server.OnRequest = (r: any) => {
// 	let log = r.request.type;
// 	if (r.request.intent)
// 		log += ` (${r.request.intent.name})`;
// 	if (r.session)
// 		log += ` - (${r.session.sessionId})`;
// 	console.log(log);
// }
// TODO ?
//server.addAllSkillsFromPackage();
server.start();
