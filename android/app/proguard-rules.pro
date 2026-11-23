# Proguard rules for Lumi Kids (Google Play Release)

# Keep Google Play Billing Client
-keep class com.android.billingclient.api.** { *; }

# Keep Firebase Models & Auth
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keep class com.google.firebase.** { *; }

# Keep Google Mobile Ads (AdMob)
-keep public class com.google.android.gms.ads.** {
   public *;
}
-keep public class com.google.ads.** {
   public *;
}

# Preserve Line Numbers for Crash Reporting
-keepattributes SourceFile,LineNumberTable
