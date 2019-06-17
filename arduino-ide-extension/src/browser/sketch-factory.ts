import { injectable, inject } from "inversify";
import URI from "@theia/core/lib/common/uri";
import { OpenerService } from "@theia/core/lib/browser";
import { FileSystem } from "@theia/filesystem/lib/common";

@injectable()
export class SketchFactory {

    @inject(FileSystem)
    protected readonly fileSystem: FileSystem;

    @inject(OpenerService)
    protected readonly openerService: OpenerService;

    public async createNewSketch(parent: URI): Promise<void> {
        const monthNames = ["january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
        ];
        const today = new Date();

        const sketchBaseName = `sketch_${monthNames[today.getMonth()]}${today.getDay()}`;
        let sketchName: string | undefined;
        for (let i = 97; i < 97 + 26; i++) {
            let sketchNameCandidate = `${sketchBaseName}${String.fromCharCode(i)}`;
            if (await this.fileSystem.exists(parent.resolve(sketchNameCandidate).toString())) {
                continue;
            }

            sketchName = sketchNameCandidate;
            break;
        }

        if (!sketchName) {
            throw new Error("Cannot create a unique sketch name");
        }

        try {
            const sketchDir = parent.resolve(sketchName);
            const sketchFile = sketchDir.resolve(`${sketchName}.ino`);
            this.fileSystem.createFolder(sketchDir.toString());
            this.fileSystem.createFile(sketchFile.toString(), { content: `
void setup() {
    // put your setup code here, to run once:

}

void loop() {
    // put your main code here, to run repeatedly:

}
`                   });
            const opener = await this.openerService.getOpener(sketchFile)
            opener.open(sketchFile, { reveal: true });
        } catch (e) {
            throw new Error("Cannot create new sketch: " + e);
        }
    }

}