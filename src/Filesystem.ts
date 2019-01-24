var fs = require('fs');
var path = require('path');

export class FileSystem {
  readFile(file: string, filePath: string): any {
    var full = path.join(filePath, file);
    return fs.readFileSync(full, 'utf8');
  }

  readJsonFile(file: string, folder: string): any {
    var content = JSON.parse(this.readFile(file, folder));
    return content;
  }

  pathExists(...args: Array<string>) {
    var folder = path.join.apply(null, args);
    try {
      return fs.statSync(folder).isDirectory();
    } catch (error) {
      return false;
    }
  }

  getFirstExistingPath(...folders: Array<string>): string {
    let result = '';
    for (let folderIndex = 0; folderIndex < folders.length; folderIndex++) {
      const folder = folders[folderIndex];
      if (this.pathExists(folder))
        result = folder;
      if (result) break;
    }
    return result;
  }

  getFirstExistingFile(files: Array<string>, folders: Array<string>): { file: string, folder: string } {
    let result = { file: '', folder: '' };

    for (let folderIndex = 0; folderIndex < folders.length; folderIndex++) {
      const folder = folders[folderIndex];

      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];

        if (this.fileExists(file, folder)) {
          result = {
            file: file,
            folder: folder
          };
        }
        if (result) break;
      }
      if (result) break;
    }

    return result;
  }

  join(...args: Array<string>): string {
    return path.join.apply(null, args);
  }

  fileExists(file: string, folder: string): boolean {
    if (folder)
      file = path.join(folder, file);
    try {
      return fs.statSync(file).isFile();
    } catch (error) {
      return false;
    }
  }

}
