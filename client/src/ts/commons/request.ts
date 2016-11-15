
interface MyRequestOption {
	method: "GET" | "POST" | "PUT" | "DELETE";
	path: string;
	reqBody?: any;
}

 export class MyRequest {
	 /** JSONのみ対応 */
	 static rest<T>(option: MyRequestOption) {
		return new Promise<T>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open(option.method, option.path);
			xhr.onload = () => {
				if (xhr.status !== 200) {
					reject();
				}
				resolve(<T> JSON.parse(xhr.responseText));
			};
			xhr.onerror = () => reject();
			if (option.reqBody) {
				xhr.send(JSON.stringify(option.reqBody));
			} else {
				xhr.send();
			}
		});
	 }
 }