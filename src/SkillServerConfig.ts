
export class SkillServerConfig {

	Port: number;
	RootPath: string;

	SslPath: string;
	SslPrivateKey: string;
	SslCertificate: string;
	SslChain: string;

	constructor(port: number) {
		this.Port = port || 443;
		this.RootPath = __dirname;
		this.SslPath = 'certs';
		this.SslPrivateKey = '';
		this.SslCertificate = '';
		this.SslChain = '';
	}

}

