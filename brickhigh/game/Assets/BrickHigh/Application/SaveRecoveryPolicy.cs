using System;
using System.Globalization;

namespace BrickHigh.Application
{
    /// <summary>暫存備份完整性檢核後可採取的提交決策。</summary>
    public enum BackupCommitDecision
    {
        /// <summary>保留目前最後良好的備份。</summary>
        PreserveLastGoodBackup = 0,
        /// <summary>只提交已完整複製且通過驗證的暫存備份。</summary>
        CommitStagedBackup = 1
    }

    /// <summary>暫存備份的複製與內容檢核結果。</summary>
    public sealed class BackupValidation
    {
        /// <summary>建立暫存複本的檢核結果。</summary>
        public BackupValidation(bool copyCompleted, bool isReadable, bool schemaMatches,
            bool requiredReferencesValidated)
        {
            CopyCompleted = copyCompleted;
            IsReadable = isReadable;
            SchemaMatches = schemaMatches;
            RequiredReferencesValidated = requiredReferencesValidated;
        }

        /// <summary>暫存複本已完整寫入。</summary>
        public bool CopyCompleted { get; }

        /// <summary>暫存複本可由存檔 adapter 讀取。</summary>
        public bool IsReadable { get; }

        /// <summary>暫存複本的 schema 符合預期。</summary>
        public bool SchemaMatches { get; }

        /// <summary>暫存複本所需的模型引用均已驗證。</summary>
        public bool RequiredReferencesValidated { get; }

        /// <summary>所有提交前檢核均通過。</summary>
        public bool IsValid => CopyCompleted && IsReadable && SchemaMatches && RequiredReferencesValidated;
    }

    /// <summary>玩家對還原提示的選擇。</summary>
    public enum RestoreConfirmation
    {
        /// <summary>尚未明確確認。</summary>
        NoChoice = 0,
        /// <summary>已明確確認還原。</summary>
        Confirmed = 1,
        /// <summary>已取消還原。</summary>
        Cancelled = 2
    }

    /// <summary>還原資料在獨立暫存位置的處理狀態。</summary>
    public enum RestoreStagingStatus
    {
        /// <summary>尚未開始暫存還原資料。</summary>
        NotStarted = 0,
        /// <summary>暫存還原資料已完成並通過驗證。</summary>
        Validated = 1,
        /// <summary>暫存或驗證失敗。</summary>
        Failed = 2
    }

    /// <summary>還原前確認、備份檢核與目前存檔保留狀態。</summary>
    public sealed class RestoreRequest
    {
        /// <summary>建立一次還原決策所需的唯讀輸入。</summary>
        public RestoreRequest(RestoreConfirmation confirmation, bool backupValidated,
            bool currentSavePreserved, RestoreStagingStatus stagingStatus)
        {
            Confirmation = confirmation;
            BackupValidated = backupValidated;
            CurrentSavePreserved = currentSavePreserved;
            StagingStatus = stagingStatus;
        }

        /// <summary>玩家對還原提示的選擇。</summary>
        public RestoreConfirmation Confirmation { get; }

        /// <summary>選定備份已通過 schema 與引用檢核。</summary>
        public bool BackupValidated { get; }

        /// <summary>目前存檔已另行保存為不可變保留副本。</summary>
        public bool CurrentSavePreserved { get; }

        /// <summary>獨立還原暫存資料的處理結果。</summary>
        public RestoreStagingStatus StagingStatus { get; }
    }

    /// <summary>還原存檔時可採取的政策決策。</summary>
    public enum RestoreDecision
    {
        /// <summary>顯示備份版本與時間，等待明確確認。</summary>
        ConfirmationRequired = 0,
        /// <summary>使用者取消，保留目前存檔。</summary>
        Cancelled = 1,
        /// <summary>拒絕未通過驗證的備份。</summary>
        RejectBackup = 2,
        /// <summary>先將目前存檔保存為不可變副本，再評估還原。</summary>
        PreserveCurrentSaveBeforeRestore = 3,
        /// <summary>已符合前置條件，可將備份複製到獨立暫存並驗證。</summary>
        StageRestore = 4,
        /// <summary>還原暫存失敗，保留目前存檔。</summary>
        KeepCurrentSaveAfterFailure = 5,
        /// <summary>提交已驗證的還原資料；目前進度副本必須保留。</summary>
        CommitRestore = 6
    }

    /// <summary>備份與還原的純決策政策，不執行檔案或資料庫操作。</summary>
    public static class SaveRecoveryPolicy
    {
        private const string RestorePromptText = "還原將回到所選備份的進度；目前資料會另行保留。";

        /// <summary>只有完整複製、可讀、schema及必要引用均通過時才允許提交暫存備份。</summary>
        public static BackupCommitDecision EvaluateBackupCommit(BackupValidation validation)
        {
            return validation != null && validation.IsValid
                ? BackupCommitDecision.CommitStagedBackup
                : BackupCommitDecision.PreserveLastGoodBackup;
        }

        /// <summary>產生明列備份版本及UTC時間的還原確認提示。</summary>
        public static string CreateRestorePrompt(string backupVersion, DateTimeOffset backupCreatedAt)
        {
            if (string.IsNullOrWhiteSpace(backupVersion))
                throw new ArgumentException("備份版本不可為空。", nameof(backupVersion));
            foreach (var character in backupVersion)
            {
                if (char.IsControl(character))
                    throw new ArgumentException("備份版本不可包含控制字元。", nameof(backupVersion));
            }
            if (backupCreatedAt == default(DateTimeOffset))
                throw new ArgumentException("備份時間不可為空。", nameof(backupCreatedAt));

            var timestamp = backupCreatedAt.UtcDateTime.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
            return RestorePromptText + Environment.NewLine
                + "版本：" + backupVersion.Trim() + Environment.NewLine
                + "時間（UTC）：" + timestamp;
        }

        /// <summary>依確認、備份與目前存檔保留狀態決定下一步；不自行執行還原或覆寫資料。</summary>
        public static RestoreDecision EvaluateRestore(RestoreRequest request)
        {
            if (request == null) return RestoreDecision.KeepCurrentSaveAfterFailure;
            if (request.Confirmation == RestoreConfirmation.Cancelled) return RestoreDecision.Cancelled;
            if (request.Confirmation != RestoreConfirmation.Confirmed) return RestoreDecision.ConfirmationRequired;
            if (!request.BackupValidated) return RestoreDecision.RejectBackup;
            if (!request.CurrentSavePreserved) return RestoreDecision.PreserveCurrentSaveBeforeRestore;

            switch (request.StagingStatus)
            {
                case RestoreStagingStatus.NotStarted:
                    return RestoreDecision.StageRestore;
                case RestoreStagingStatus.Validated:
                    return RestoreDecision.CommitRestore;
                case RestoreStagingStatus.Failed:
                default:
                    return RestoreDecision.KeepCurrentSaveAfterFailure;
            }
        }
    }
}
