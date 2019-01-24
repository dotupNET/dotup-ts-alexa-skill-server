// Copyright 2017-2019, Peter Ullrich. dotup IT solutions
import { SkillServerConfig } from "./SkillServerConfig";
import Express from 'express';
import https from 'https'
import bodyParser from 'body-parser';
import { FileSystem } from "./Filesystem";

//var https = require('https');
//var express = require('express');
//var fs = require('alexaworld-nodejs-common').filesystem;
//var bodyParser = require('body-parser');
//const isTypeOf = require('alexaworld-nodejs-common').isTypeOf;


export class SkillServer {

  Config: SkillServerConfig;

  Skills: Array<any>;
  //  Skills: Array<NodeSkill>;
  Express: Express.Express | undefined;
  Server: https.Server | undefined;
  Router?: Express.Router;
  fs: FileSystem = new FileSystem();

  constructor(port: number) {
    this.Config = new SkillServerConfig(port);
    this.Skills = new Array<any>();
  }

  configure(configurator: (config: SkillServerConfig) => void) {
    configurator(this.Config);
  }

  addSkill(skillName: string, skillPath: string, fileName: string = 'index.js') {
    if (!skillPath)
      skillPath = '';

    const folder = this.fs.join(this.Config.RootPath, skillPath, skillName);

    // let files = [
    // 	`${skillName}.js`,
    // 	"index.js"
    // ];

    //var file = this.fs.getFirstExistingFile(files, folders);

    if (!this.fs.pathExists(folder))
      throw new Error(`Path <${folder}> not found`);

    if (!this.fs.fileExists(fileName, folder))
      throw new Error(`Skill <${skillName}> file (${fileName}) not found.`);

    var skill = {
      name: skillName,
      file: fileName,
      path: folder
    }

    this.Skills[<any>skill.name] = skill;
  }

  addSkillFromPackage(skillPath: string) {
    if (!skillPath)
      skillPath = '';

    var skill = this.getSkillFromPackage(this, skillPath);
    this.Skills[skill.name] = skill;
  }

  start() {
    this.Express = Express();
    var httpsServer = https.createServer(this.getCredentials(this), this.Express);
    //this.server = httpsServer.listen(this.Port, this.Host);
    this.Server = httpsServer.listen(this.Config.Port);
    this.Router = Express.Router(); //.Router();
    this.Express.use("/alexa", this.Router);
    this.loadSkills(this);
  }

  loadSkills(server: SkillServer): void {
    for (const key in server.Skills) {
      if (server.Skills.hasOwnProperty(key)) {
        const item = server.Skills[key];
        var skill = require(this.fs.join(item.path, item.file));
        // TODO
        // if (skill instanceof NodeSkill) && item.appId) {
        //   skill.AppId = item.appId;
        // }
        if (!server.Router) {
          return;
        }
        server.Router.use("/" + item.name, bodyParser.json());
        server.Router.post("/" + item.name, async function (req: any, res: any, callback: any) {
          //var json = req.body;
          let log = req.body.request.type;
          if (req.body.request.intent)
            log += ` (${req.body.request.intent.name})`;
          console.log(log);

          try {
            // skill.handler(req.body, res);
            if (skill.handler) {
              var response = skill.handler(req.body, res, (err: any, result: any) => {
                res.json(result).send();
              });
            } else {

              var response = await skill.HttpRequestHandler(req.body, res);
              res.json(response).send();
            }
          } catch (error) {
            res.status = 500;
            callback(error);
          }
        });
        console.log(`Skill: ${item.name} | Description: ${item.description} | Version: ${item.version} mapped to "/alexa/${item.name}"`);
      }
    }


  }

  getSkillFromPackage(server: SkillServer, skillPath: string): any {
    var folder = this.fs.join(server.Config.RootPath, skillPath);
    if (!this.fs.pathExists(folder))
      throw new Error(`Path <${folder}> not found`);

    var packageFile: any = this.fs.readJsonFile("package.json", folder); // this.fs.readFileSync(path.join(folder, ));

    let appId = packageFile.AlexaWorld && packageFile.AlexaWorld.APP_ID ? packageFile.AlexaWorld.APP_ID : null;

    var skill = {
      appId: appId,
      description: packageFile.description,
      version: packageFile.version,
      name: packageFile.name,
      file: packageFile.main,
      path: folder
    }
    return skill;
  }

  getCredentials(skillServer: SkillServer): any {
    var certPath = this.fs.join(skillServer.Config.RootPath, skillServer.Config.SslPath);

    var key = this.fs.readFile(skillServer.Config.SslPrivateKey, certPath);
    var cert = this.fs.readFile(skillServer.Config.SslCertificate, certPath);
    var ca = this.fs.readFile(skillServer.Config.SslChain, certPath);

    return {
      key: key,
      cert: cert,
      ca: ca
    };
  }

}
