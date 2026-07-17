/* Scope 01 controlled partial publication fixture.
    This negative-path fixture is not positive proof of a live SEC capture. */
(function () {
    "use strict";

    var root = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this);
    var company = root.RLCOMPANY;
    if (!company) throw new Error("RLCOMPANY must load before the company foundation fixture");

    var companyId = "sec-cik-0000789019";
    var publicationId = "company-publication-sec-cik-0000789019-g1";
    var generation = 1;
    var partialFixtureSha256 = "sha256:e4426b6b914313d3bdc21927c6fc9a7177c66eff161d942104f8e11dc84c022b";
    var configFingerprint = "sha256:ffedf9489fc65522a6cf7a3f8593717f3ba179a604b1672dc26969296f700519";
    var objectPath = "data/company-fundamentals/objects/";

    function deepFreeze(value) {
        if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
        Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
        return Object.freeze(value);
    }

    function objectRef(objectId, value) {
        var sha256 = company.companyObjectSha256(value);
        return {
            contractVersion: "company-object-ref/v1",
            path: objectPath + sha256.slice(7) + ".json",
            sha256: sha256,
            objectId: objectId
        };
    }

    var clocks = {
        reportingPeriodEnd: "2026-03-31",
        sourcePublishedAt: "2026-04-29T20:06:24.000Z",
        acceptedAt: "2026-04-29T20:06:24.000Z",
        retrievedAt: "2026-07-16T21:26:24Z",
        observedAt: null
    };

    var source = {
        contractVersion: "source-artifact/v1",
        sourceId: "source-sec-submissions-msft-20260716",
        companyId: companyId,
        sourceKind: "sec-submissions",
        url: "https://data.sec.gov/submissions/CIK0000789019.json",
        documentId: "CIK0000789019-submissions",
        clocks: clocks,
        contentSha256: partialFixtureSha256,
        rights: "redistributable-structured",
        availability: "available",
        limitations: [
            "This controlled partial fixture is not the complete SEC response and is not positive source proof.",
            "No company-facts response was captured, so financial statement concepts remain unavailable."
        ]
    };
    var sourceRef = objectRef(source.sourceId, source);

    var companyFactsSource = {
        contractVersion: "source-artifact/v1",
        sourceId: "sec-companyfacts-msft",
        companyId: companyId,
        sourceKind: "sec-companyfacts",
        url: "https://data.sec.gov/api/xbrl/companyfacts/CIK0000789019.json",
        documentId: "CIK0000789019-companyfacts",
        clocks: {
            reportingPeriodEnd: "2026-03-31",
            sourcePublishedAt: null,
            acceptedAt: null,
            retrievedAt: null,
            observedAt: null
        },
        contentSha256: null,
        rights: "redistributable-structured",
        availability: "link-unavailable",
        limitations: [
            "No SEC Company Facts response bytes were retained for this publication.",
            "Revenue and every dependent output remain unavailable until a policy-compliant capture is validated."
        ]
    };
    var companyFactsSourceRef = objectRef(companyFactsSource.sourceId, companyFactsSource);

    var period = {
        contractVersion: "reporting-period/v1",
        periodId: "period-msft-fy2026-q3",
        kind: "quarter",
        start: "2026-01-01",
        end: "2026-03-31",
        durationDays: 90,
        fiscalYear: 2026,
        fiscalQuarter: 3,
        form: "10-Q",
        accession: "0001193125-26-191507",
        filedAt: "2026-04-29T20:06:24.000Z",
        amendmentState: "original",
        comparability: "qualified",
        qualifications: [
            "The source extract proves filing identity and period metadata only; it does not contain statement observations."
        ]
    };
    var periodRef = objectRef(period.periodId, period);

    var identity = {
        contractVersion: "company-identity/v1",
        companyId: companyId,
        issuerName: "MICROSOFT CORP",
        ticker: "MSFT",
        exchange: "Nasdaq",
        securityName: "Common Stock",
        cik: "0000789019",
        reportingCurrency: "USD",
        fiscalYearEnd: "06-30",
        accountingBasis: "US-GAAP",
        identitySourceRefs: [sourceRef],
        continuity: {
            state: "continuous",
            decision: "accepted",
            predecessorCompanyIds: [],
            rationale: "The SEC CIK, issuer name, ticker, and exchange identify one filing entity and common-stock listing."
        },
        status: "verified"
    };
    var identityRef = objectRef("identity-msft", identity);

    var summary = {
        contractVersion: "company-dossier-summary/v1",
        summaryId: "summary-msft-foundation-g1",
        publicationId: publicationId,
        generation: generation,
        companyId: companyId,
        evidenceCutoff: "2026-04-29T20:06:24.000Z",
        direction: {
            state: "unavailable",
            label: "Unavailable",
            reason: "A source-qualified revenue observation is required before direction can be evaluated.",
            missingFactIds: ["fact-revenue"]
        },
        independentFacts: [
            {
                factId: "fact-issuer-name",
                label: "SEC filing entity",
                value: "MICROSOFT CORP",
                state: "current"
            }
        ]
    };
    var summaryRef = objectRef(summary.summaryId, summary);

    var observation = {
        contractVersion: "fact-observation/v1",
        observationId: "obs-sec-issuer-name",
        companyId: companyId,
        evidenceClass: "reported",
        sourceRef: sourceRef,
        periodRef: null,
        sourceConcept: "sec-submissions:name",
        value: "MICROSOFT CORP",
        valueType: "string",
        unit: "entity-name",
        currency: null,
        decimals: null,
        signConvention: "not-applicable",
        state: "current",
        clocks: clocks,
        definition: "SEC filing entity name from the public submissions response.",
        qualifiers: [
            "Identity observation; not a financial statement amount."
        ]
    };

    var dossier = {
        contractVersion: "company-dossier/v1",
        dossierId: "dossier-msft-foundation-g1",
        publicationId: publicationId,
        generation: generation,
        companyId: companyId,
        evidenceCutoff: "2026-04-29T20:06:24.000Z",
        identityRef: identityRef,
        periodRefs: [periodRef],
        sourceRefs: [sourceRef, companyFactsSourceRef],
        observations: [observation],
        normalizedFacts: [
            {
                contractVersion: "normalized-fact/v1",
                factId: "fact-revenue",
                normalizedConcept: "revenue",
                currentObservationId: null,
                observationIds: [],
                mappingId: "mapping-revenue",
                mappingVersion: "us-gaap-revenue/v1",
                transformation: {
                    sign: 1,
                    scalePower10: 0,
                    aggregation: "none"
                },
                resolutionState: "unavailable",
                resolutionReason: "No source-qualified company-facts response was captured in this session."
            }
        ],
        mappings: [
            {
                mappingId: "mapping-revenue",
                mappingVersion: "us-gaap-revenue/v1",
                sourceConcept: "us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax",
                normalizedConcept: "revenue",
                state: "unavailable",
                interpretation: "Use only a source-qualified US GAAP revenue observation for the same issuer and period."
            }
        ],
        formulas: [
            {
                formulaId: "formula-direction-foundation",
                formulaVersion: "direction-foundation/v1",
                interpretation: "Direction is unavailable until the required revenue observation and comparison period exist.",
                inputFactIds: ["fact-revenue"]
            }
        ],
        claims: [
            {
                claimId: "claim-direction",
                claimClass: "direction",
                state: "unavailable",
                label: "Fundamental direction",
                text: "Unavailable: a source-qualified revenue observation is missing.",
                observationIds: [],
                transformationIds: ["mapping-revenue", "formula-direction-foundation"],
                consumerIds: ["simple-direction", "foundation-owner-read"],
                restatementIds: ["restatement-status"],
                conflictIds: ["conflict-status"],
                unavailableLinkIds: ["missing-revenue-observation"]
            }
        ],
        consumers: [
            {
                consumerId: "simple-direction",
                surface: "simple",
                role: "visible direction band"
            },
            {
                consumerId: "foundation-owner-read",
                surface: "owner-read",
                role: "explicit unavailable outcome"
            }
        ],
        dependencyGraph: {
            nodes: [
                {
                    id: "fact-issuer-name",
                    kind: "fact",
                    state: "available",
                    value: "MICROSOFT CORP"
                },
                {
                    id: "fact-revenue",
                    kind: "fact",
                    state: "unavailable",
                    value: null
                },
                {
                    id: "metric-direction",
                    kind: "metric",
                    state: "available",
                    value: "not-evaluated"
                },
                {
                    id: "model-brief-eligibility",
                    kind: "model",
                    state: "available",
                    value: "not-evaluated"
                },
                {
                    id: "identity-summary",
                    kind: "projection",
                    state: "available",
                    value: "MICROSOFT CORP | MSFT"
                }
            ],
            edges: [
                {
                    from: "fact-revenue",
                    to: "metric-direction"
                },
                {
                    from: "metric-direction",
                    to: "model-brief-eligibility"
                },
                {
                    from: "fact-issuer-name",
                    to: "identity-summary"
                }
            ]
        },
        evidenceCoverage: [
            {
                evidenceClass: "reported",
                state: "partial",
                currentCount: 1,
                unavailableCount: 1,
                cutoff: "2026-04-29T20:06:24.000Z",
                explanation: "SEC identity and quarterly filing metadata are present; company-facts observations are unavailable."
            }
        ],
        restatements: [
            {
                restatementId: "restatement-status",
                state: "none-recorded",
                observationIds: [],
                explanation: "No statement observation was captured, so no restatement conclusion is available."
            }
        ],
        conflicts: [
            {
                conflictId: "conflict-status",
                state: "none-recorded",
                observationIds: [],
                explanation: "No competing eligible financial observation was captured."
            }
        ],
        unavailableLinks: [
            {
                unavailableLinkId: "missing-revenue-observation",
                concept: "revenue",
                requiredSourceId: "sec-companyfacts-msft",
                sourceConcept: "us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax",
                periodId: "period-msft-fy2026-q3",
                reason: "A company-facts response was not captured because the required SEC_USER_AGENT process input was unavailable."
            }
        ],
        validation: {
            status: "validated",
            checks: [
                "company identity",
                "source rights and clocks",
                "period identity",
                "missing-value dependency propagation",
                "claim trace completeness"
            ]
        }
    };
    var dossierRef = objectRef(dossier.dossierId, dossier);

    var ownerRead = {
        contractVersion: "fundamentals-tool-read/v1",
        readId: "owner-read-msft-foundation-g1",
        publicationId: publicationId,
        generation: generation,
        companyId: companyId,
        status: "unavailable",
        statementCutoff: "2026-03-31",
        modelCutoff: null,
        briefCutoff: null,
        marketCutoff: null,
        direction: "Unavailable",
        missingFactIds: ["fact-revenue"],
        limitations: [
            "Identity and filing metadata only; no source-qualified financial statement observation was captured.",
            "No recommendation or confident substitute is published."
        ]
    };
    var ownerReadRef = objectRef(ownerRead.readId, ownerRead);

    var history = {
        contractVersion: "company-history-index/v1",
        historyId: "history-msft-foundation-g1",
        publicationId: publicationId,
        generation: generation,
        companyId: companyId,
        entries: []
    };
    var historyRef = objectRef(history.historyId, history);

    var objects = {};
    objects[source.sourceId] = source;
    objects[companyFactsSource.sourceId] = companyFactsSource;
    objects[period.periodId] = period;
    objects["identity-msft"] = identity;
    objects[summary.summaryId] = summary;
    objects[dossier.dossierId] = dossier;
    objects[ownerRead.readId] = ownerRead;
    objects[history.historyId] = history;

    var manifest = {
        contractVersion: "company-publication-manifest/v1",
        publicationId: publicationId,
        generation: generation,
        companyId: companyId,
        createdAt: "2026-07-16T21:26:24Z",
        sourceCutoff: "2026-04-29T20:06:24.000Z",
        configFingerprint: configFingerprint,
        policyVersions: {
            config: "company-config-policy/v1",
            identity: "company-identity-policy/v1",
            period: "reporting-period-policy/v1",
            mapping: "concept-mapping-policy/v1",
            dependency: "dependency-propagation-policy/v1",
            publication: "company-publication-policy/v1",
            rights: "public-evidence-rights-policy/v1"
        },
        identityRef: identityRef,
        summaryRef: summaryRef,
        dossierRef: dossierRef,
        modelPackRef: null,
        briefRef: null,
        ownerReadRef: ownerReadRef,
        sourceRefs: [sourceRef, companyFactsSourceRef],
        historyRefs: [historyRef],
        validation: {
            status: "validated",
            checks: [
                "complete reachable object graph",
                "canonical object hashes",
                "single company and generation",
                "source rights and clocks",
                "missing-value dependency propagation",
                "claim trace completeness"
            ]
        },
        manifestSha256: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
    };
    manifest.manifestSha256 = company.companyManifestSha256(manifest);

    var bundle = {
        contractVersion: "company-publication-bundle/v1",
        sourceExtract: {
            contractVersion: "company-source-fixture-state/v1",
            sha256: partialFixtureSha256,
            completeResponse: false,
            positiveSourceProof: false
        },
        manifest: manifest,
        objects: objects
    };
    var validation = company.validatePublicationGraph(bundle.manifest, bundle.objects);
    if (!validation.ok) throw new Error("invalid company foundation fixture: " + JSON.stringify(validation.errors));

    root.RLCOMPANY_FOUNDATION_FIXTURE = deepFreeze(bundle);
})();