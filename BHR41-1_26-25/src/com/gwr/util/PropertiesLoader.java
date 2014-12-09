package com.gwr.util;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Reads in SDHL properties configuration file
 * 
 *
 */
public class PropertiesLoader {

	/**
	 * This method looks for the properties file in the same directory as the jar file itself
	 * 
	 * @param propertiesName
	 * @return
	 * @throws FileNotFoundException
	 * @throws IOException
	 */
	public static Properties load( String propertiesName ) throws FileNotFoundException, IOException {
	
		Properties properties = new Properties();

		InputStream in = PropertiesLoader.class.getResourceAsStream("/" + propertiesName);
		properties.load(in);

		return properties;
	}
}
