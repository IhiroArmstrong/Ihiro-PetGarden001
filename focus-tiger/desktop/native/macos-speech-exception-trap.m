#import "macos-speech-exception-trap.h"

BOOL FTRunCatching(void (^block)(void), NSString *_Nullable *_Nullable outReason) {
  @try {
    block();
    return YES;
  } @catch (NSException *exception) {
    if (outReason != NULL) {
      *outReason = exception.reason ?: exception.name;
    }
    return NO;
  }
}
