import { BerechnungsParameterModel } from "../models";
import { ofType } from "@shared/redux-builder";
import { unionizeActions } from "@shared/redux-builder/unionize-actions";
import { TeuerungsrechnerdatenDto } from "./effect.spec";
import { BfsRemoteData } from "@shared/remote-data";

export const teuerungsrechnerActionsRecord = {
    datenLaden: ofType<null>(),
    applyBerechnungsParameterChanged: ofType<Partial<BerechnungsParameterModel>>(),
    applyBerechne: ofType<null>(),
    applyDatenLaden: ofType<BfsRemoteData<TeuerungsrechnerdatenDto>>()
};

export const TeuerungsrechnerActions = unionizeActions(teuerungsrechnerActionsRecord);