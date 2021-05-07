export enum Role {
	Member = 0,
	Admin = 1
}

export class User {
	id: number;
	pseudo: string;
	email: string;
	lastName: string;
	firstName: string
	password: string;
	birthDate: string;
	role: Role;
	reputation: number;
	token: string;
	constructor(data: any) {
		if (data) {
			this.id = data.id;
			this.pseudo = data.pseudo;
			this.email = data.email;
			this.lastName = data.lastName;
			this.firstName = data.firstName;
			this.password = data.password;
			this.birthDate = data.birthDate &&
				data.birthDate.length > 10 ? data.birthDate.substring(0, 10) : data.birthDate;
			this.role = data.role || Role.Member;
			this.reputation = data.reputation || 0;
			this.token = data.token;
		}
	}
	public get roleAsString(): string {
		return Role[this.role];
	  }

	public get reputationAsString(): string {
		return String(this.reputation);
	}
}
