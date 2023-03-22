import crypto from 'crypto';
import fs from 'fs';
import request from 'request';

// get hash of a file using 'crypto' module
function sha256(filePath: string) {
	const hash = crypto.createHash('sha256');
	const stream = fs.createReadStream(filePath);
	return new Promise((resolve, reject) => {
		stream.on('data', (chunk) => hash.update(chunk));
		stream.on('end', () => resolve(hash.digest('hex')));
		stream.on('error', (error) => reject(error));
	});
}

// compare hash of two images
export async function bothImagesAreSame(path1: string, path2: string) {
	// console.log('will compare the sha-256 hash of both images');
	const hash1 = await sha256(path1);
	const hash2 = await sha256(path2);
	// console.log('returning the result of the comparison');
	return hash1 === hash2;
}

// delete a file using 'fs' module
export function deleteAFile(filePath: string) {
	fs.unlinkSync(filePath);
}

// download a file/image
export const downloadAnImage = function (
	uri: string,
	filename: string,
	callback: any
) {
	request.head(uri, function (err, res, body) {
		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	});
};
