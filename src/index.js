// I know the code is ugly, I wrote it in 15m

const path = require('path');
const fs = require('fs');
const pn = require('pn/fs');
const svg2png = require('svg2png');

const inputPath = path.join(__dirname, '../input');
const outputPath = path.join(__dirname, '../output');

if (!fs.existsSync(inputPath)) return console.log('No input folder found');
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

// I tried doing all at once but my pc crashed so I am not gone do that again
// So I put in chunks instead. I think I will also make it changable value

function chunkArray(ary, chunkSize) {
	let tempArray = [];

	for (let index = 0; index < ary.length; index += chunkSize) {
		let myChunk = ary.slice(index, index + chunkSize);
		tempArray.push(myChunk);
	}

	return tempArray;
}

function doChunk(chunk) {
	let outputs = chunk.map(fileName => {
		console.log('Processing', fileName);
		const filePath = path.join(inputPath, fileName);
		return pn.readFile(filePath)
			.then(file => svg2png(file, {width: 500, height: 500}))
			.then(output => {
				return {
					file: fileName,
					output: output
				};
			});
	});
	return Promise.all(outputs)
		.then(results => {
			const promises = [];
			results.forEach(output => {
				var pos = output.file.lastIndexOf(".");
				fileOutputPath = output.file.substr(0, pos < 0 ? output.file.file.length : pos) + ".png";
				promises.push(pn.writeFile(path.join(outputPath, fileOutputPath), output.output)
					.then(() => {
						return pn.unlink(path.join(inputPath, output.file));
					})
					.then(() => {
						console.log('Completed', output.file);
					}))
			});
			return Promise.all(promises);
		});
}

pn.readdir(inputPath)
	.then(async (files) => {
		const chunks = chunkArray(files, 20);
		for (const chunk of chunks) {
			try {
				await doChunk(chunk);
			} catch (error) {
				console.log('Chunk Failed');
			}
		}
	})