package com.bst.util;

import java.util.Random;

public class OtpGeneration {
	public static String getOtp() {
		Random r = new Random();
		int otp = 100000 + r.nextInt(900000);
		return String.valueOf(otp);
	}
}
