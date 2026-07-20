#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SkidsAssetCache, NSObject)

RCT_EXTERN_METHOD(getCachedAssetUrl:(NSString *)remoteUrl
                  cacheKey:(NSString *)cacheKey
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(prefetchAssets:(NSArray *)assets
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearCache:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
