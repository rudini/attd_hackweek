import { BerechnungsParameterModel } from "../models";
import { unionizeActions, ofType } from "src/app/shared/redux-builder/unionize-actions";

export const teuerungsrechnerActionsRecord = {
    datenLaden: ofType<null>(),
    berechnungsParameterChanged: ofType<Partial<BerechnungsParameterModel>>(),
    berechne: ofType<null>(),
};

export const TeuerungsrechnerActions = unionizeActions(teuerungsrechnerActionsRecord);