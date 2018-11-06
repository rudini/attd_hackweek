import { BerechnungsParameterModel } from "../models";
import { ofType } from "@shared/redux-builder";
import { unionizeActions } from "@shared/redux-builder/unionize-actions";

export const teuerungsrechnerActionsRecord = {
    datenLaden: ofType<null>(),
    berechnungsParameterChanged: ofType<Partial<BerechnungsParameterModel>>(),
    berechne: ofType<null>(),
};

export const TeuerungsrechnerActions = unionizeActions(teuerungsrechnerActionsRecord);