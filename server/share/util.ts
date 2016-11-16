import {CONF_VAR,
	TopicInfo,
	TopicEditForm,
	ValidateRule
} from "./Interfaces";
import {Express, Request, Response} from 'express';

export class MyUtil {
	static validate(rules: ValidateRule[]) {
		for ( let {rule, msg} of rules) {
			if (!rule) {
				const errMsg = msg ? msg : CONF_VAR.ERR_MSG.unexpected_error;
				throw new Error(errMsg);
			}
		}
	}

	static sendError(res: Response, message: string) {
		res.status(500).send({message: message});
	}
}