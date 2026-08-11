#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SkidsAppInfo, NSObject)

RCT_EXTERN_METHOD(getVersion:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

