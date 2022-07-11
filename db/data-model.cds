namespace my.Survey;

entity Workflow {
    key project_ID  : Integer;
    key workflow_ID : String(50);
}

entity RegionMasterTable {
    key Region       : String(50)
            @Core.Computed;
        Description  : String(510) not null;
        ParentRegion : String(50);
}

entity Parent_Region {
    key ParentRegion : String(50);
}

entity DepartmentMasterTable {
    key DepartmentID     : String(50)
            @Core.Computed;
        Description      : String(510) not null;
        ParentDepartment : String(50);
}

entity Parent_Department {
    key ParentDepartment : String(50);
}

entity CommodityMasterTable {
        Domain           : String(50) not null;
        //  @Core.Computed;
    key UniqueName       : String(100);
        Name             : String(255) not null;
        ParentUniqueName : String(100);
}

entity Parent_Commodity {
    key ParentUniqueName : String(100);
}

entity RiskControlMasterTable {
        AssessmentIDs         : String(100) not null;
        ContractClauseImpact  : String(100) not null;
        ControlDescriptionMLS : String(100);
    key ControlID             : String(100);
        ControlName           : String(100) not null;
        ControlOwner          : String(100) not null;
        ControlOwnerType      : String(100) not null;
        ControlType           : String(100) not null;
        DecisionMaker         : String(100) not null;
        DecisionMakerType     : String(100) not null;
        RegulatorMandated     : String(100) not null;
        RiskType              : String(100) not null;
}

entity AssessmentQuestionnaireTable {
    key QuestionnaireID   : String(50)
            @Core.Computed;
        RiskControlID     : Association to one RiskControlMasterTable;
    key QuestionnaireName : String(55);
    key QuestionID        : String(50);
        Commodity         : Association to one CommodityMasterTable;
        Region            : Association to one RegionMasterTable;
        Department        : Association to one DepartmentMasterTable;
        Questions         : String(500) not null;
        ScoringWeightage  : Integer not null;
        AnswerID          : Association to one AnswerTypeMasterTable;
}

entity AnswerTypeMasterTable {
    key AnswerID   : String
            @Core.Computed;
    key AnswerType : String(99);
}

entity PublishedQuestionnaire {
    key QuestionnaireID   : String(50)
            @Core.Computed;
        QuestionnaireName : String(55) not null;
        Publish           : PublishedQuestionnaire.Publish;
}

entity ApprovalGroupParticipants {
    key ApprovalGroup : String(100)
            @Core.Computed;
    key UserID        : String(100);
        UserMail      : String(100);
}

entity QuestionnaireApprovalGroups {
    key QuestionnaireID      : String(50);
    key QuestionnaireName    : String(55)
            @Core.Computed;
    key ApprovalGroup        : String(100);
        AllApprovalsRequired : QuestionnaireApprovalGroups.AllApprovalsRequired;
}

entity CustomSelectAnswers {
    key QuestionnaireID : String(50); //Association to one AssessmentQuestionnaireTable;
    key QuestionID      : String(50);
        AnswerID        : String;
        Answer          : String;
}


entity AssessmentRequests {
    key ID                : Integer;
        ProjectTitle      : String(100) not null;
        Commodity         : Association to one CommodityMasterTable;
        Region            : Association to one RegionMasterTable;
        Department        : Association to one DepartmentMasterTable;
        Supplier          : Association to one SupplierUserMasterTable;
        Deadline          : Date;
        QuestionnaireID   : String(50); //Association to one PublishedQuestionnaire;
        RequestorID       : String(100);
        RequestorName     : String(100);
        ResponderUserType : AssessmentRequests.ResponderUserType;
        ResponderUserID   : String(100);
        ResponderUserName : String(100);
        ResponderEmail    : String(100);
        Project_Status    : AssessmentRequests.Project_Status;
}

entity RoleCollection {
    key RoleID                : Integer
            @Core.Computed;
        UserType              : String(10) not null;
        RoleDescription       : String(50);
        BTPRoleCollectionName : String(50) not null;
}

entity SupplierUserMasterTable {
    key erpVendorId                     : String(40);
        smVendorId                      : String(100);
        masterVendorId                  : String(100);
        sourceSystem                    : String(100);
        name1                           : String(100);
        name2                           : String(100);
        name3                           : String(100);
        name4                           : String(100);
        phone                           : String(100);
        fax                             : String(100);
        line1                           : String(100);
        line2                           : String(100);
        line3                           : String(100);
        postalCode                      : String(100);
        poBox                           : String(100);
        city                            : String(100);
        state                           : String(100);
        stateName                       : String(100);
        countryCode                     : String(100);
        taxIdentificationNumberTypeCode : String(100);
        partyTaxID                      : String(100);
        longPartyTaxID                  : String(100);
        dunsId                          : String(100);
        active                          : String(100);
        s4OrgSystemId                   : String(100);
        firstName                       : String(100);
        middleName                      : String(100);
        lastName                        : String(100);
        telephone                       : Integer;
        mobileCountryCode               : String(10);
        mobilePhone                     : String(10);
        email                           : String(100);
        type                            : String(10);
        locale                          : String(100);
        title                           : String(100);
        categories                      : String(100);
        regions                         : String(100);
        timeZoneID                      : String(100);
        isPrimary                       : String(100);
}

entity InternalUserMasterTable {
    key LoginID      : String(100)
            @Core.Computed;
        firstName    : String(100);
        lastName     : String(100);
        creationDate : Date;
        emailAddress : String(100);
        phone        : String(15);
        departmentId : String(100);
        position     : String(100);
        UserType     : String(10);
        SupplierID   : Association to one SupplierUserMasterTable;
}

entity ResponseDetails {
    key ProjectID       : Integer; //: Association to one AssessmentRequests;
    key ProjectTitle    : String(100);
    key QuestionnaireID : String(50);
    key QuestionID      : String(50);
        Question        : String(50);
        //AnswerType : String(100);
        AnswerID        : String;
        Response        : String(500);
}

entity ApproverDetails {
    key ProjectID       : Integer; //: Association to one AssessmentRequests;
    key QuestionnaireID : String(50);
    key UserID          : String(100);
        ApprovalStatus  : ApproverDetails.ApprovalStatus;
}

entity ApproverGrading {
    key ProjectID       : Integer;
    key QuestionnaireID : String(50);
    key QuestionID      : String(50);
        Question        : String(50);
        AnswerID        : String;
        Response        : String(500);
    key ApproverID      : String(50);
        Grade           : Integer;
}

entity Test {
    key ID : Double
            @Core.Computed;
}

@assert.range
type ApproverDetails.ApprovalStatus : String(100) enum {
    Open;
    Closed;
}

@assert.range
type AssessmentRequests.Project_Status : String(50) enum {
    Open;
    OpenWithSupplier;
    OpenWithApprover;
    Closed;
}

@assert.range
type AssessmentRequests.ResponderUserType : String(10) enum {
    Internal;
    Supplier;
}

@assert.range
type PublishedQuestionnaire.Publish : String(10) enum {
    Yes;
    No;
}

@assert.range
type QuestionnaireApprovalGroups.AllApprovalsRequired : String(10) enum {
    Yes;
    No;
}
