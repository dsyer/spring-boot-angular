package com.example.demo;

import java.util.Arrays;
import java.util.List;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

@RunWith(Parameterized.class)
public class ParamTests {

    @Parameters
	public static List<Object[]> parameters() {
        return Arrays.asList(new Object[] {"foo"}, new Object[] {"bar"});
    }

   public ParamTests(String value) {}

   @Test
   public void test() {
       Assert.assertTrue(false);
   }
}