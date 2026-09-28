using System;
using BrickHigh.Application;
using NUnit.Framework;

namespace BrickHigh.Tests
{
    public class SaveRecoveryPolicyTests
    {
        [Test, Property("TDD", "UT-149")]
        public void CommitBackup_InvalidTemporaryCopy_PreservesLastGood()
        {
            var invalidCopies = new[]
            {
                new BackupValidation(false, true, true, true),
                new BackupValidation(true, false, true, true),
                new BackupValidation(true, true, false, true),
                new BackupValidation(true, true, true, false)
            };

            foreach (var validation in invalidCopies)
            {
                Assert.That(SaveRecoveryPolicy.EvaluateBackupCommit(validation),
                    Is.EqualTo(BackupCommitDecision.PreserveLastGoodBackup));
            }

            Assert.That(SaveRecoveryPolicy.EvaluateBackupCommit(null),
                Is.EqualTo(BackupCommitDecision.PreserveLastGoodBackup));
            Assert.That(SaveRecoveryPolicy.EvaluateBackupCommit(
                    new BackupValidation(true, true, true, true)),
                Is.EqualTo(BackupCommitDecision.CommitStagedBackup));
        }

        [Test, Property("TDD", "UT-150")]
        public void RestoreSave_NoConfirmation_PreservesCurrentProgress()
        {
            var createdAt = new DateTimeOffset(2030, 5, 1, 12, 34, 56, TimeSpan.FromHours(8));
            var prompt = SaveRecoveryPolicy.CreateRestorePrompt("save-schema-3", createdAt);

            Assert.That(prompt, Does.Contain("還原將回到所選備份的進度；目前資料會另行保留。"));
            Assert.That(prompt, Does.Contain("版本：save-schema-3"));
            Assert.That(prompt, Does.Contain("時間（UTC）：2030-05-01 04:34:56"));

            var noChoice = SaveRecoveryPolicy.EvaluateRestore(new RestoreRequest(
                RestoreConfirmation.NoChoice, backupValidated: true, currentSavePreserved: true,
                RestoreStagingStatus.Validated));
            var cancelled = SaveRecoveryPolicy.EvaluateRestore(new RestoreRequest(
                RestoreConfirmation.Cancelled, backupValidated: true, currentSavePreserved: true,
                RestoreStagingStatus.Validated));
            var unvalidatedBackup = SaveRecoveryPolicy.EvaluateRestore(new RestoreRequest(
                RestoreConfirmation.Confirmed, backupValidated: false, currentSavePreserved: true,
                RestoreStagingStatus.Validated));
            var currentSaveNotPreserved = SaveRecoveryPolicy.EvaluateRestore(new RestoreRequest(
                RestoreConfirmation.Confirmed, backupValidated: true, currentSavePreserved: false,
                RestoreStagingStatus.Validated));
            var failedRestore = SaveRecoveryPolicy.EvaluateRestore(new RestoreRequest(
                RestoreConfirmation.Confirmed, backupValidated: true, currentSavePreserved: true,
                RestoreStagingStatus.Failed));
            var stagedRestore = SaveRecoveryPolicy.EvaluateRestore(new RestoreRequest(
                RestoreConfirmation.Confirmed, backupValidated: true, currentSavePreserved: true,
                RestoreStagingStatus.NotStarted));
            var confirmedRestore = SaveRecoveryPolicy.EvaluateRestore(new RestoreRequest(
                RestoreConfirmation.Confirmed, backupValidated: true, currentSavePreserved: true,
                RestoreStagingStatus.Validated));

            Assert.That(noChoice, Is.EqualTo(RestoreDecision.ConfirmationRequired));
            Assert.That(cancelled, Is.EqualTo(RestoreDecision.Cancelled));
            Assert.That(unvalidatedBackup, Is.EqualTo(RestoreDecision.RejectBackup));
            Assert.That(currentSaveNotPreserved, Is.EqualTo(RestoreDecision.PreserveCurrentSaveBeforeRestore));
            Assert.That(failedRestore, Is.EqualTo(RestoreDecision.KeepCurrentSaveAfterFailure));
            Assert.That(stagedRestore, Is.EqualTo(RestoreDecision.StageRestore));
            Assert.That(confirmedRestore, Is.EqualTo(RestoreDecision.CommitRestore));
        }

        [Test, Property("TDD", "UT-150")]
        public void CreateRestorePrompt_InvalidVersionOrTimestamp_RejectsInput()
        {
            var createdAt = new DateTimeOffset(2030, 5, 1, 4, 34, 56, TimeSpan.Zero);

            Assert.Throws<ArgumentException>(() => SaveRecoveryPolicy.CreateRestorePrompt(" ", createdAt));
            Assert.Throws<ArgumentException>(() => SaveRecoveryPolicy.CreateRestorePrompt("save-schema-3\n已確認", createdAt));
            Assert.Throws<ArgumentException>(() => SaveRecoveryPolicy.CreateRestorePrompt("save-schema-3", default(DateTimeOffset)));
        }
    }
}
