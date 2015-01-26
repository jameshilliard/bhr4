package com.gwr.util;


import java.io.IOException;
import java.net.InetAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.text.NumberFormat;

import org.apache.commons.net.ntp.NTPUDPClient;
import org.apache.commons.net.ntp.NtpUtils;
import org.apache.commons.net.ntp.NtpV3Packet;
import org.apache.commons.net.ntp.TimeInfo;
import org.apache.commons.net.ntp.TimeStamp;


public final class NTPClient
{

    private static final NumberFormat numberFormat = new java.text.DecimalFormat("0.00");

    /**
     * Process <code>TimeInfo</code> object and print its details.
     * @param info <code>TimeInfo</code> object.
     * @throws IOException 
     */
    public static long getNTPTime() throws IOException
    {
        NTPUDPClient client = new NTPUDPClient();
        // We want to timeout if a response takes longer than 10 seconds
        client.setDefaultTimeout(10000);
 
        client.open();
        InetAddress hostAddr = InetAddress.getByName("0.north-america.pool.ntp.org");
        TimeInfo info = client.getTime(hostAddr);

        NtpV3Packet message = info.getMessage();
        int stratum = message.getStratum();
        int version = message.getVersion();
        int refId = message.getReferenceId();
        String refAddr = NtpUtils.getHostAddress(refId);
        String refName = null;
        if (refId != 0) {
            if (refAddr.equals("127.127.1.0")) {
                refName = "LOCAL"; // This is the ref address for the Local Clock
            } else if (stratum >= 2) {
                // If reference id has 127.127 prefix then it uses its own reference clock
                // defined in the form 127.127.clock-type.unit-num (e.g. 127.127.8.0 mode 5
                // for GENERIC DCF77 AM; see refclock.htm from the NTP software distribution.
                if (!refAddr.startsWith("127.127")) {
                    try {
                        InetAddress addr = InetAddress.getByName(refAddr);
                        String name = addr.getHostName();
                        if (name != null && !name.equals(refAddr)) {
                            refName = name;
                        }
                    } catch (UnknownHostException e) {
                        // some stratum-2 servers sync to ref clock device but fudge stratum level higher... (e.g. 2)
                        // ref not valid host maybe it's a reference clock name?
                        // otherwise just show the ref IP address.
                        refName = NtpUtils.getReferenceClock(message);
                    }
                }
            } else if (version >= 3 && (stratum == 0 || stratum == 1)) {
                refName = NtpUtils.getReferenceClock(message);
                // refname usually have at least 3 characters (e.g. GPS, WWV, LCL, etc.)
            }
            // otherwise give up on naming the beast...
        }
        if (refName != null && refName.length() > 1) {
            refAddr += " (" + refName + ")";
        }
 
  
        // Originate Time is time request sent by client (t1)
         long destTime = info.getReturnTime();
  
 
        // Destination time is time reply received by client (t4)
        TimeStamp destNtpTime = TimeStamp.getNtpTime(destTime);
        return destNtpTime.getTime();
 
    }

    public static void main(String[] args)
    {
    	
    	NTPClient c = new NTPClient();
    	try {
			System.out.println(c.getNTPTime());
			String f = String.valueOf(c.getNTPTime());
					System.out.println(f.substring(0, f.length() - 3));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
     }

}
