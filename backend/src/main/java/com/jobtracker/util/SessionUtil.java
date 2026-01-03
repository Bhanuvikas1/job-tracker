package com.jobtracker.util;

import jakarta.servlet.http.HttpSession;

public final class SessionUtil {
    private SessionUtil() {}

    public static final String USER_ID = "USER_ID";

    public static Long getUserId(HttpSession session) {
        Object v = session.getAttribute(USER_ID);
        if (v instanceof Long l) return l;
        if (v instanceof Integer i) return i.longValue();
        return null;
    }

    public static void setUserId(HttpSession session, Long userId) {
        session.setAttribute(USER_ID, userId);
    }
}
