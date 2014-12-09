package com.gwr.util;

import java.util.LinkedHashSet;
import java.util.Random;
import java.util.Set;

public class NumberUtil {
	public static Set<Integer> generateNoDuplicateInteger(int low, int high,
			int needSize) {

		Random rng = new Random();
		Set<Integer> generated = new LinkedHashSet<Integer>();
		int seed = high - low;

		while (generated.size() < needSize) {
			Integer next = rng.nextInt(seed) + low;
			generated.add(next);
		}

		return generated;

	}

}
