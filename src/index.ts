import { TileContentType } from "./enums/TileContentType.js";
import { GameHistory, HamsterData, InitHamsterLogEntry, LogEntryType, MoveLogEntry, PickGrainLogEntry, PutGrainLogEntry, WriteLogEntry } from "./GameHistory.js";
import { HamsterGame } from "./HamsterGame.js";
import { HamsterGUIClient } from "./network/HamsterGUIClient.js";
import { HamsterStatusPoll } from "./network/HamsterStatusPoll.js";
import { HamsterSimulatorClient } from "./simulation/HamsterSimulatorClient.js";
import { HamsterGameControls } from "./ui/controls/HamsterGameControls.js";
import { WebControls } from "./ui/controls/WebControls.js";
import { WebInputHandler } from "./ui/controls/WebInputHandler.js";
import { GrainProvider } from "./ui/entityProviders/GrainProvider.js";
import { HamsterProvider } from "./ui/entityProviders/HamsterProvider.js";
import { WallProvider } from "./ui/entityProviders/WallProvider.js";
import { GameLogGui } from "./ui/GameLogGui.js";
import { GuiConfig } from "./ui/GuiConfig.js";
import { WebGui } from "./ui/territory/WebGui.js";

function findDivByClasses(parent: Document | HTMLElement, mainClassName: string, additionalClassName?: string): Element {
    let allContainers = parent.getElementsByClassName(mainClassName);
    if (allContainers.length == 1) {
        return allContainers[0];
    } else if (allContainers.length > 1 && additionalClassName) {
        allContainers = parent.getElementsByClassName("webHamsterControlsContainer " + additionalClassName);
        if (allContainers.length == 1) {
            return allContainers[0];
        } else {
            throw new Error(`Couldn't find a unique container with the class ${mainClassName} and ${additionalClassName}`);
        }
    } else {
        throw new Error(`Couldn't find a unique container with the class ${mainClassName}`);
    }
}

export function main(webHamsterParent?: HTMLElement, allElementsClassName?: string) {

    const parent = webHamsterParent ?? document;

    

    const controls: HamsterGameControls = new WebControls(findDivByClasses(parent, "webHamsterControlsContainer", allElementsClassName));
    const client: HamsterGUIClient = new HamsterStatusPoll("http://localhost:8080");
    const guiConfig = new GuiConfig("res/Grain.svg", "res/Wall.svg", "res/Hamster.svg");
    const gui = new WebGui(findDivByClasses(parent, "webHamsterTerritoryConatiner", allElementsClassName), guiConfig._maxGrainsVisible);
    const game = new HamsterGame();
    const hamsterProvider = new HamsterProvider(guiConfig._hamsterImgPath);
    const grainProvider = new GrainProvider(guiConfig._grainImgPath);
    const wallProvider = new WallProvider(guiConfig._wallImgPath);
    const handler: WebInputHandler = new WebInputHandler(
        findDivByClasses(parent, "webHamsterAlertBox", allElementsClassName) as HTMLDivElement,
        findDivByClasses(parent, "webHamsterAlertBoxContent", allElementsClassName) as HTMLElement,
        findDivByClasses(parent, "webHamsterBtnOKAlert", allElementsClassName) as HTMLElement,
        findDivByClasses(parent, "webHamsterInputBox", allElementsClassName) as HTMLDivElement,
        findDivByClasses(parent, "webHamsterInputMessage", allElementsClassName) as HTMLElement,
        findDivByClasses(parent, "webHamsterInputTextField", allElementsClassName) as HTMLInputElement,
        findDivByClasses(parent, "webHamsterBtnAbortInput", allElementsClassName) as HTMLElement,
        findDivByClasses(parent, "webHamsterBtnOKInput", allElementsClassName) as HTMLButtonElement,
        findDivByClasses(parent, "webHamsterInputForm", allElementsClassName) as HTMLFormElement,
        findDivByClasses(parent, "webHamsterInputTextFieldErrorMsg", allElementsClassName) as HTMLDivElement,
    );
    const gameLog = new GameLogGui(findDivByClasses(parent, "webHamsterGameLog", allElementsClassName), hamsterProvider);

    gui.registerEntityProvider(TileContentType.HAMSTER, hamsterProvider);
    gui.registerEntityProvider(TileContentType.GRAIN, grainProvider);
    gui.registerEntityProvider(TileContentType.WALL, wallProvider);
    client.addStatusReceiver(game, "0", true);
    client.addNewGameListener({
        newGame: (gameId, guiClient) => {
            if (guiClient.currentlyRunningGames.length === 1) {
                guiClient.updateStatusReceiver(game, gameId, true);
            }
        }
    });
    game.addDeltaListener(gui);
    game.addDeltaListener(gameLog);
    game.addInputInterface(controls);
    game.addInputInterface(handler);
    game.reset();
    client.start();
}

export function mainSimulation(webHamsterParent?: HTMLElement, allElementsClassName?: string): HamsterSimulatorClient {

    const parent = webHamsterParent ?? document;

    const controls: HamsterGameControls = new WebControls(findDivByClasses(parent, "webHamsterControlsContainer", allElementsClassName));
    const client = new HamsterSimulatorClient();
    const guiConfig = new GuiConfig();
    const gui = new WebGui(findDivByClasses(parent, "webHamsterTerritoryConatiner", allElementsClassName), guiConfig._maxGrainsVisible);
    const game = new HamsterGame();
    const hamsterProvider = new HamsterProvider(guiConfig._hamsterImgPath);
    const grainProvider = new GrainProvider(guiConfig._grainImgPath);
    const wallProvider = new WallProvider(guiConfig._wallImgPath);
    const gameLog = new GameLogGui(findDivByClasses(parent, "webHamsterGameLog", allElementsClassName), hamsterProvider);

    gui.registerEntityProvider(TileContentType.HAMSTER, hamsterProvider);
    gui.registerEntityProvider(TileContentType.GRAIN, grainProvider);
    gui.registerEntityProvider(TileContentType.WALL, wallProvider);
    client.addStatusReceiver(game, "0", true);
    client.addNewGameListener({
        newGame: (gameId, guiClient) => {
            if (guiClient.currentlyRunningGames.length === 1) {
                guiClient.updateStatusReceiver(game, gameId, true);
            }
        }
    });
    game.addDeltaListener(gui);
    game.addDeltaListener(gameLog);
    game.addInputInterface(controls);
    game.reset();
    client.start();
    return client;
}

export type Simulator = HamsterSimulatorClient;

export const exampleLog: GameHistory = JSON.parse(`{
  "territory": {
    "size": {
      "columnCount": 6,
      "rowCount": 6
    },
    "tileContents": [
      {
        "hamsterId": 0,
        "direction": "SOUTH",
        "type": "HAMSTER",
        "location": {
          "row": 0,
          "column": 0
        }
      },
      {
        "type": "WALL",
        "location": {
          "row": 0,
          "column": 5
        }
      },
      {
        "type": "WALL",
        "location": {
          "row": 1,
          "column": 5
        }
      },
      {
        "type": "WALL",
        "location": {
          "row": 2,
          "column": 5
        }
      },
      {
        "type": "WALL",
        "location": {
          "row": 3,
          "column": 5
        }
      },
      {
        "type": "WALL",
        "location": {
          "row": 4,
          "column": 5
        }
      },
      {
        "type": "WALL",
        "location": {
          "row": 5,
          "column": 0
        }
      },
      {
        "type": "WALL",
        "location": {
          "row": 5,
          "column": 5
        }
      }
    ]
  },
  "logEntries": [
    {
      "hamsterId": 0,
      "type": "PUT_GRAIN"
    },
    {
      "hamsterId": 0,
      "type": "MOVE"
    },
    {
      "hamsterId": 0,
      "type": "PUT_GRAIN"
    },
    {
      "hamsterId": 0,
      "type": "MOVE"
    },
    {
      "hamsterId": 0,
      "type": "PUT_GRAIN"
    },
    {
      "hamsterId": 0,
      "type": "MOVE",
      "errorMessage": "Trololol Hallo"
    },
    {
      "hamsterId": 0,
      "type": "PUT_GRAIN"
    },
    {
      "hamsterId": 0,
      "type": "MOVE"
    },
    {
      "message": "Done placing grains",
      "hamsterId": 0,
      "type": "WRITE"
    },
    {
      "hamster": {
        "hamsterId": 1,
        "direction": "SOUTH",
        "type": "HAMSTER",
        "location": {
          "row": 0,
          "column": 0
        }
      },
      "type": "INIT_HAMSTER"
    },
    {
      "hamsterId": 1,
      "type": "PICK_GRAIN"
    },
    {
      "hamsterId": 1,
      "type": "MOVE"
    },
    {
      "hamsterId": 1,
      "type": "PICK_GRAIN"
    },
    {
      "hamsterId": 1,
      "type": "MOVE"
    },
    {
      "hamsterId": 1,
      "type": "PICK_GRAIN"
    },
    {
      "hamsterId": 1,
      "type": "MOVE"
    },
    {
      "hamsterId": 1,
      "type": "PICK_GRAIN"
    },
    {
      "hamsterId": 1,
      "type": "MOVE"
    }
  ]
}`);