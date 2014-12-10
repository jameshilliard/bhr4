package com.gwr.bhr4.api;

import java.util.List;
import java.util.Map;

import com.gwr.bhr4.json.JSONAbstract;

public abstract class ModelAbstract extends JSONAbstract {
	@SuppressWarnings({ "rawtypes" })
	protected long getNextIDInList(String idString, List<Map> modelList) {

		// if original array is empty, start with 1
		if (modelList == null || modelList.isEmpty())
			return 1;

		long maxIDInList = 0;
		for (Map model : modelList) {
			Long lid = (Long) model.get(idString);
			if (lid > maxIDInList) {
				maxIDInList = lid;
			}
		}

		return (maxIDInList + 1);
	}

}
