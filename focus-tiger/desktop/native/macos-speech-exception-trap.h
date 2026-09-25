#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Catch NSException from AVAudioEngine (Swift `try` does not catch these).
BOOL FTRunCatching(void (^block)(void), NSString *_Nullable *_Nullable outReason);

NS_ASSUME_NONNULL_END
