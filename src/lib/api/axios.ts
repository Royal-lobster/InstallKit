import axios from "axios";

export const homebrewApi = axios.create({
	baseURL: "https://formulae.brew.sh/api",
	timeout: 10000,
});
