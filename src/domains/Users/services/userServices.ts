import prisma from "../../../../config/prismaClient";
import { User } from "@prisma/client";
import bcrypt = require("bcrypt");

class UserService {

	async encryptPassword(password: string) {
		const saltRounds = 10;
		const encryptPassword = await bcrypt.hash(password, saltRounds);
		return encryptPassword;
	}

	async create(body: User) {
		const user = await prisma.user.create({
			data: {
				name: body.name,
				email: body.email,
				photo: body.photo,
				password: body.password,
				role: body.role,
				MusicsHeard: {
					create: [],
				}
			},

		});

		user.password = await this.encryptPassword(body.password);

		return user;
	}

	async delete(id: number) {
		const deletedUser = await prisma.user.delete({
			where: {
				idUser: id,
			},
		});

		return deletedUser;
	}

	async listAll() {

		const users = await prisma.user.findMany({
			include: {
				MusicsHeard: true,
			},
		});
		return users;
	}

	async listByEmail(email: string) {

		const users = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		return users;
	}

	async update(id: number, data: Partial<User>) {

		if (data.password) {
			data.password = await this.encryptPassword(data.password);
		}
		const updateUser = await prisma.user.update({
			where: {
				idUser: id,
			},
			data: data,
		});
		return updateUser;

	}
	async addNewMusics(userId: number, musics: string[]) {

		if (!Array.isArray(musics)) {
			musics = [musics];
		}

		const updateUser = await prisma.user.update({

			where: {
				idUser: userId,
			},
			data: {
				MusicsHeard: {
					connect: musics.map((musicId) => ({ idMusic: parseInt(musicId) })),
				},
			},
		});
		return updateUser;
	}

}


export default new UserService();
