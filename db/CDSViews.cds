namespace my.Views;

using my.Survey as my from '../db/data-model';

/*entity WorkflowView as select from my.FirstWorkflow {
    project_ID,
    workflow_ID
};*/
entity ProjectApprovalGroupParticipants as
    select from my.QuestionnaireApprovalGroups
    inner join my.ApprovalGroupParticipants
        on QuestionnaireApprovalGroups.ApprovalGroup = ApprovalGroupParticipants.ApprovalGroup
    inner join my.AssessmentRequests
        on QuestionnaireApprovalGroups.QuestionnaireID = AssessmentRequests.QuestionnaireID
    {
        key AssessmentRequests.ID,
        key AssessmentRequests.QuestionnaireID,
        key ApprovalGroupParticipants.ApprovalGroup,
            ApprovalGroupParticipants.UserID,
            ApprovalGroupParticipants.UserMail
    };

view Graders as
    select from ProjectApprovalGroupParticipants
    left outer join my.InternalUserMasterTable
        on ProjectApprovalGroupParticipants.UserID = InternalUserMasterTable.LoginID
    {
        ID,
        LoginID,
        UserMail,
        firstName,
        lastName
    };

view ApproverStatus as
    select from ProjectApprovalGroupParticipants
    full outer join my.ApproverDetails
        on  ProjectApprovalGroupParticipants.ID     = ApproverDetails.ProjectID
        and ProjectApprovalGroupParticipants.UserID = ApproverDetails.UserID
    {
        key ID,
        key ProjectApprovalGroupParticipants.UserID,
            case
                when
                    ApproverDetails.ApprovalStatus is not null
                then
                    ApproverDetails.ApprovalStatus
                else
                    'Open'
            end as![Status] : String
    };

view ProjectStatus as
    select key ID from ApproverStatus
    where
        Status = 'Closed';

view ApprovalGroups as select distinct key ApprovalGroup from my.ApprovalGroupParticipants;
view PublishedQuestionnaireID as select distinct key QuestionnaireID from my.QuestionnaireApprovalGroups;

view Grading as
    select from my.ApproverGrading
    left outer join my.AssessmentQuestionnaireTable
        on  ApproverGrading.QuestionnaireID = AssessmentQuestionnaireTable.QuestionnaireID
        and ApproverGrading.QuestionID      = AssessmentQuestionnaireTable.QuestionID
    {
        key ApproverGrading.ProjectID,
            ApproverGrading.QuestionnaireID,
            ApproverGrading.QuestionID,
            ApproverGrading.Question,
            ApproverGrading.AnswerID,
            ApproverGrading.Response,
            ApproverGrading.Grade,
            ApproverGrading.ApproverID,
            AssessmentQuestionnaireTable.ScoringWeightage,
            (
                Grade
            ) * (
                ScoringWeightage
            ) as Multiplication : Integer
    };

view ApproverFinalGradingScore as
    select from Grading {
        key ProjectID,
            ApproverID,
            cast(
                Sum(
                    Multiplication
                ) / Sum(
                    ScoringWeightage
                ) as     Integer
            ) as Score : Integer
    }
    group by
        ProjectID,
        ApproverID;

view ProjectFinalGradingScore as
    select from Grading {
        key ProjectID,
            cast(
                Sum(
                    Multiplication
                ) / Sum(
                    ScoringWeightage
                ) as          Integer
            ) as FinalScore : Integer
    }
    group by
        ProjectID;


view OpenAssessmentRequest as
    select distinct key ID from ApproverStatus
    where
        Status = 'Open';

view OOTBReport as
    select from my.AssessmentRequests
    inner join ProjectFinalGradingScore
        on AssessmentRequests.ID = ProjectFinalGradingScore.ProjectID
    left outer join OpenAssessmentRequest
        on AssessmentRequests.ID = OpenAssessmentRequest.ID
    {
        key AssessmentRequests.ID               as ProjectID,
            AssessmentRequests.ProjectTitle,
            AssessmentRequests.RequestorName,
            AssessmentRequests.Supplier         as SupplierName,
            AssessmentRequests.Deadline         as Date,
            AssessmentRequests.Commodity        as Category,
            AssessmentRequests.Region,
            AssessmentRequests.Department,
            'RiskControl'                       as RiskControl : String,
            ProjectFinalGradingScore.FinalScore as RiskControlScore
    //OpenAssessmentRequest.ID
    }
    where
            AssessmentRequests.Project_Status =  'Closed'
        and OpenAssessmentRequest.ID          is null;

view QuestionnaireID as
    select from PublishedQuestionnaireID
    inner join my.AssessmentQuestionnaireTable
        on PublishedQuestionnaireID.QuestionnaireID = AssessmentQuestionnaireTable.QuestionnaireID
    {
        key PublishedQuestionnaireID.QuestionnaireID,
            AssessmentQuestionnaireTable.Commodity  as Commodity,
            AssessmentQuestionnaireTable.Region     as Region,
            AssessmentQuestionnaireTable.Department as Department,
            AssessmentQuestionnaireTable.QuestionID,
            AssessmentQuestionnaireTable.Questions
    };

view FinalQuestionnaireID as
    select distinct
        key QuestionnaireID,
            Commodity,
            Region,
            Department
    from QuestionnaireID;

view AssessmentRequestStatus as
    select from my.AssessmentRequests
    full join ApproverStatus
        on AssessmentRequests.ID = ApproverStatus.ID
    {
        key AssessmentRequests.ID as ID,
        key ProjectTitle,
            UserID,
            Commodity,
            Department,
            Deadline,
            QuestionnaireID,
            Region,
            RequestorName,
            ResponderUserID,
            ResponderUserType,
            Supplier,
            ApproverStatus.Status as Project_Status
    };
//order by AssessmentRequests.ID;

view UserDetails as
    select from my.InternalUserMasterTable {
        LoginID,
        concat(
            concat(
                firstName, ' '
            ), lastName
        ) as fullName : String,
        InternalUserMasterTable.UserType,
        creationDate,
        emailAddress,
        phone,
        departmentId,
        position,
        SupplierID
    };
