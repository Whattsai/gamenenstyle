---
name: mighty-pm
description: "Coordinate a requested skill or natural-language task as an accountable delivery PM: inspect the work, choose safe delegation, integrate results, and verify completion. Use when explicitly invoked as $mighty-pm."
---

# Mighty PM

`mighty-pm` is an orchestration layer. It does not replace the domain workflow selected by the user; it studies that workflow, coordinates execution, and owns its final acceptance evidence.

## Invocation and input

Treat every part of the user's message after `$mighty-pm` as one complete task request. Do not require a delimiter, JSON, a fixed field order, or a parameter format.

Examples that must work:

```text
$mighty-pm well-done docs/tdd/SPEC-021-Example-TDD.md
$mighty-pm (well-done docs/tdd/SPEC-021-Example-TDD.md)
$mighty-pm perfect-plan 將 docs/requirements/MVP-021-Example.md 規劃到可開發交接
$mighty-pm 檢查這次 App 登入問題，找出原因、修正並驗證
```

When the request begins with a skill name, with or without `$`, use that skill as the target. Pass all remaining text to it intact as its task input. When the request is natural language, identify the applicable available skill from its stated purpose. If no specialised skill applies, treat the complete text as the task. Do not invent an argument grammar or discard wording that may constrain the task.

Optional surrounding parentheses group the complete target request; recognize the skill inside that grouping and preserve the task wording and constraints. Parentheses are not required.

Read the target `SKILL.md` in full before taking target-task actions. Also read every instruction file, source document, and target-workspace guidance required by that skill. User instructions and applicable `AGENTS.md` rules take precedence over this skill.

Check for conflicting readiness, approval, continuation, and completion rules before scheduling affected work. Resolve them using instruction priority, specific prerequisites, and the user's existing authorization. A general instruction to keep working does not itself satisfy a missing prerequisite or authorize a scope change. If a material conflict remains unresolved, hold only the dependent work, explain the exact conflicting instructions, and request the missing decision while continuing independent authorized work.

If the target skill or the intended outcome cannot be determined with reasonable confidence, ask one concise question that identifies the missing choice. Do not ask the user to reformat an otherwise understandable task.

## Whole-workflow planning boundary

Plan the complete target request as one scope before dispatching work. Include every applicable stage, nested skill, deliverable, required audit, acceptance-evidence preparation, and conditional repair/revalidation loop in the initial plan, with owners, dependencies, and completion conditions. Planning once means establishing this full baseline; refine conditional tasks from actual findings without inventing their defects in advance or repeatedly creating separate plans for each newly reached stage. Update the baseline when evidence or authorized scope changes require it.

Workflow stages remain eligible for delegation based on capability, risk, cost, and ownership, including stages named audit, review, or acceptance. Such names do not automatically make them PM closeout or require the main agent to execute them. In `$mighty-pm (well-done xxx)`, the initial scope includes TDD, Frontend UX when applicable, SPEC/BDD/implementation deep audit, any resulting repair-and-audit cycles, and the required delivery artifacts. The deep audit may be a planned worker assignment; its methodology and full coverage requirements still apply.

Respect the workflow's stage gates and dependencies when scheduling; a complete initial plan does not mean all stages start in parallel. When assigning one stage of a broader skill, tell the worker which part to execute and where to hand back its result, so it does not also execute downstream work owned by another task. Conditional repair and re-audit assignments are execution of the original scope, not repeated PM closeout.

PM closeout starts only after all applicable tasks within that scope, including required audits and triggered repair loops, are complete and their evidence has been reviewed. The main agent retains accountability throughout and personally performs the final overall acceptance and handoff after those tasks finish.

## Completion contract

Before any target-task write or external action, create an observable completion contract. State it concisely in the work update without waiting for approval, unless a material user decision is genuinely required. The contract is the basis for delegation, integration, verification, and the final conclusion.

Build the contract from these sources, in order:

1. the user's explicit outcome, scope, and constraints;
2. the target skill's required stages, deliverables, gates, and acceptance criteria; and
3. the following PM minimum assurance when the first two sources leave a gap.

For every completion item, record the intended deliverable, its acceptance condition, the evidence or verification method, the owner, dependencies, and its status. The contract must also state scope exclusions and any verification that cannot run, with its reason and available substitute evidence.

PM minimum assurance requires that:

- each committed deliverable has a locatable artifact or result;
- every required verification that can run has an actual recorded outcome;
- each unexecuted verification has a reason, a substitute check when available, and a named follow-up condition;
- the main agent reviews and integrates subagent work before accepting it; and
- every completion item is mapped to its evidence in the final response or a linked acceptance record.

Do not invent business rules, product acceptance criteria, or user decisions to fill a gap. Ask one concise question only when the missing decision would materially change the outcome; otherwise make the smallest reasonable implementation assumption and identify it in the contract.

## PM responsibility

Keep the main agent on the model and reasoning effort selected for the current conversation. Do not override it.

Extend the completion contract into one execution record rather than maintaining a duplicate plan. Map each deliverable or acceptance item to its source, dependencies, affected files or resources, write ownership, validation method, and risk. For substantial work, identify the dependency chain that determines completion and the next integration milestone; prioritize work that unblocks it. Give material risks an owner, a trigger, and a mitigation or fallback. Use this record to choose the smallest effective execution plan.

The main agent is accountable for the target workflow's definition of done. It must:

1. preserve the target skill's required stages, gates, evidence, and deliverables while satisfying the completion contract;
2. decide which work is sequential and which is independently parallelisable;
3. assign each writing subagent a non-overlapping ownership boundary;
4. integrate results, resolve conflicts, and ensure omissions are repaired by itself or an explicitly assigned worker;
5. ensure the assigned owners execute the target workflow's required verification and acceptance checks, and personally assess the returned evidence; and
6. report completion only with evidence satisfying the completion contract and the target skill.

Execution and review may be delegated; final accountability remains with the main agent. A worker's completion report means ready for review, not accepted delivery.

## Work packages and ownership

Before delegating, divide the committed scope into deliverables small enough to assign, verify, and integrate. Ensure every acceptance item has an owner and that no deliverable is implemented twice. Inspection may overlap deliberately when an independent review justifies its cost.

Give each worker a bounded assignment containing:

- the task ID, source requirements, relevant instructions, and expected artifact;
- its unique execution owner and exact writable files or resources, including exclusions;
- dependencies, the agreed contract version, and the condition for starting;
- acceptance checks, required evidence, and any shared environment reservation; and
- when to return a blocker or change request, plus the expected return format: changed artifacts, checks and results, assumptions, and remaining issues.

Inspect existing changes in every affected repository before assigning writes, including nested repositories. Preserve user work and avoid assigning an uncertain overlapping edit until its boundary is resolved. Shared DTOs, schemas, generated files, and mutable test environments need an explicit owner or isolated resources; different source files alone do not establish independence. Confirm a worker has stopped writing or has been isolated before transferring its ownership.

## Adaptive delegation

Use delegation only when it improves the task. Keep decision making, shared-contract control, integration oversight, final consolidated document updates, and the final overall acceptance decision with the main agent. Planned workflow implementation, audit, verification, and stage-document updates may be assigned to workers within explicit ownership boundaries without transferring final accountability.

For every target skill, evaluate whether safe, worthwhile independent work exists. Delegate that work when it does and delegation is available and authorized, even when the target skill does not explicitly prescribe parallel execution. Execute serially when dependencies, shared write ownership, explicit restrictions, runtime availability, or coordination cost make delegation unsuitable. Once work enters main-agent closeout, apply the stricter delegation criteria in that section.

Suitable parallel work includes independent codebase exploration, evidence gathering, test/log analysis, and implementation or tests whose write sets, contracts, and test environments do not overlap. Keep shared DTOs, public API contracts, database migrations, shared test fixtures, and final audits sequential unless their boundaries are demonstrably isolated.

Choose the worker model and reasoning effort from the models available in the current environment according to the task's complexity, risk, and expected value. Use the least costly capable worker for bounded read-heavy work and reserve deeper reasoning for isolated implementation, testing, or review that warrants it. If the user explicitly specifies worker model, effort, concurrency, or ownership constraints in natural language, honor those constraints when they are valid and available.

Choose the actual number of concurrent workers from the independent task count, runtime capacity, shared-resource risk, and coordination cost. Treat runtime capacity as a ceiling; do not fill it merely because it is available. Do not delegate trivial work, and reuse an existing worker for its owned follow-up when that avoids repeating context discovery.

Workers may not create further workers. If a worker discovers overlap, a shared-resource dependency, or an uncertain boundary, return the finding to the main agent for rescheduling rather than editing outside its ownership.

## Live dispatch board

For delegated, multi-stage, or resumable work, maintain a concise live dispatch board in the main conversation. Publish the initial board before the first worker starts. Update the affected row when a worker is dispatched, starts, waits, becomes blocked, completes, fails, resumes, is replaced, or has its work accepted into integration. This board is the user-visible view of the execution record; do not require the user to request it separately.

Each row must show the task ID, bounded task, owner, selected worker model and reasoning effort, writable files or resources, status, dependencies or blocker, and planned or completed validation. Use only the model and effort values actually supplied to a worker launch. Mark a task `active` only after dispatch succeeds; if the launch is unavailable or rejected, mark it `not started` with the reason. Keep status values concise: `planned`, `queued`, `active`, `waiting`, `blocked`, `integrating`, `verified`, `failed`, `not started`, or `replaced`.

When work is serial, publish one row for the main agent and state why delegation is unsuitable. Do not turn the board into a stream of routine tool output; report meaningful state changes and link to the persistent execution record when one exists.

## Worker interruption and resumption

The PM owns the full recovery loop for a stopped worker, including one executing `well-done`. A stopped turn is not proof that the assigned task is complete.

1. Inspect the worker's actual runtime state, last report, artifacts, and verification evidence. If its deliverable is ready, send it through normal acceptance; otherwise record the task ID, worker ID, completed and remaining work, write ownership, stop reason, and concrete resume condition. Mark the affected task `Blocked` while that condition is unmet.
2. Resolve ordinary implementation failures and recoverable environment issues within existing authority. If user input is necessary, notify the user in the current conversation with the affected task, the reason intervention is needed, the specific decision or operation requested, and how completion can be confirmed. Where an instruction requires the pause, cite the exact file and rule. Consolidate related questions and preserve prior authorization instead of requesting it again. Continue independent authorized work.
3. Persist the checkpoint before awaiting user action. Use the runtime's supported input or wait mechanism when available; if the run must end, state that the task remains pending and that the user should reply after completing the requested action. Do not promise background resumption without runtime support, or treat silence or elapsed time as approval.
4. When the user responds or an observable prerequisite changes, reconcile the response with the pending request and verify that the resume condition is satisfied. Update any affected decision or contract version. A reply does not by itself prove that an external operation succeeded; use available evidence. If a required condition remains unmet, keep only affected work blocked and explain what is still missing.
5. Once the condition is satisfied, continue without another approval for the same authorized work. Prefer the original worker when it remains usable. Use the runtime's follow-up or resume operation that actually starts its next turn; merely noting that work should resume or sending a passive message to an idle worker is insufficient. Supply the resolved decision, current checkpoint, remaining scope, writable resources, contract version, and required checks. Record the dispatch result and mark `Running` only when continuation is confirmed.
6. If continuation fails or the original worker is unavailable, confirm it cannot still write to the assigned resources before transferring ownership. Assign a replacement worker or take over locally using the same task ID and checkpoint, preserving valid completed work. If neither route is feasible, retain the pending state and report the specific external condition needed to proceed.
7. Track the resumed task through further reports or runtime completion events. Reapply this recovery loop if it stops again, subject to the cost and retry rules below. Review the returned work, integrate it, and run the required acceptance checks. Close the blocker only after its resume condition is satisfied; accept the deliverable only after its evidence passes review. Resumption alone never means completion.

## Cost and progress control

Optimize for the cost of an accepted result, including worker context, coordination, review, and expected rework as well as execution time. Use available capability and cost information; do not assume that model names establish prices. When price or usage data is unavailable, use labeled qualitative estimates or observable measures such as elapsed time, worker count, and retry rounds. Do not claim measured savings or minimum monetary cost without evidence.

Respect any user budget or deadline and reserve capacity for integration, verification, and likely repairs. Without an explicit budget, use a modest execution envelope and checkpoints proportionate to the task; do not invent a hard monetary limit or ask for one merely to begin ordinary work. Record why delegation is worthwhile, supply only the necessary context, and reuse verified findings instead of repeating discovery.

At an integration milestone, material blocker, or repeated failure, compare progress and available usage against the plan. Do not repeat the same failed attempt without new evidence or a changed approach. Diagnose the cause, then revise the assignment, change an available worker model or effort, reduce concurrency, or take over locally. If workers are unavailable, continue feasible work with the main agent. A resource limit or deadline does not justify silently reducing acceptance criteria; surface any required tradeoff before exceeding an explicit limit or changing scope.

## Change control and checkpoints

When a requirement, shared contract, dependency, or ownership boundary changes, record the decision and its impact on deliverables, tests, schedule, and cost. Resolve routine implementation choices within existing authority; request a decision only for material choices that lack authorization. Notify affected workers and hold work based on an invalid assumption. Update the agreed contract version, mark affected results and evidence as needing revalidation, then resume in dependency order. Preserve unaffected verified work.

For multi-stage, delegated, or resumable work, persist the execution record in the target workflow's existing task or handoff document; use a small adjacent record if none exists. Keep the current scope, task owners and states, dependencies, material risks and decisions, acceptance evidence, and next action there. Update it at meaningful milestones and before handing off or pausing. On resume, reconcile it with the actual working tree and live workers before assigning more work. Simple tasks may use a concise work update instead.

Read [execution records and scenario checks](references/execution-record.md) when creating a persistent record or validating changes to this skill. Reuse its fields within the existing workflow rather than creating competing status documents.

## Main-agent closeout

Enter closeout only after every applicable task in the complete target request has finished, its required evidence has been reviewed, and its workflow gates are satisfied. Implementation being finished is insufficient while a planned audit, triggered repair, revalidation, or delivery artifact remains pending. Blocked or deferred tasks keep the workflow in execution or recovery; they do not become closeout work merely because other workers have finished.

The main agent directly performs the following work using the available tools:

- confirm the assembled artifacts and cross-task consistency against the completion contract;
- assess current verification and audit evidence, performing final integration checks only where coverage is missing or changes have invalidated earlier evidence;
- make small, bounded repairs when doing so costs less than another assignment and handoff, then repeat the affected checks;
- update final workflow documents, traceability, task states, and acceptance evidence; and
- confirm workers are no longer writing the final artifacts, make the acceptance decision, and deliver the final report.

If closeout exposes a concrete defect or an omitted required workflow task, mark the affected item incomplete and update the same plan. Resolve small bounded issues directly. For substantial isolated work worth delegating, return the affected work to workflow execution, record the unmet criterion, reason for delegation, ownership, and return evidence, and reuse the relevant worker when suitable. Resume closeout only after that work and any affected revalidation finish. An audit that was already required belongs in the original workflow plan, not in a new routine closeout review cycle.

Do not repeat a completed workflow audit solely because PM closeout has begun, or repeatedly delegate general audits, confirmation reviews, documentation cleanup, or minor repairs after the required checks have passed. Assess the actual evidence rather than merely accepting a worker's success claim. New failures or changes may justify targeted work and revalidation; uncertainty without a specific unresolved acceptance concern does not justify another review cycle. Do not restart the whole plan or lower acceptance criteria to finish. The main agent directly completes the final overall acceptance and handoff.

## Integration and verification

As each prerequisite result arrives, inspect its returned evidence and actual changes in every affected repository before scheduling dependent work. Do not wait for unrelated workers merely to finish a batch. Resolve conflicts and confirm that every required item remains traceable to its source requirement, implementation, and verification. Ensure the assigned verification owner runs the required cross-component and regression checks against the integrated current artifacts; earlier isolated worker results do not establish integrated correctness. The main agent assesses the actual results. Repeat checks when changes invalidate them, without rerunning unaffected expensive checks without cause.

Respect target-skill restrictions on external systems, user decisions, approvals, and irreversible actions. Continue all safe in-scope work, but do not fabricate missing decisions or claim an unavailable verification ran.

Before final delivery, reconcile the completion contract item by item:

- `Verified`: the acceptance condition is satisfied by current, inspectable evidence.
- `Accepted equivalent evidence`: an allowed substitute demonstrates the same acceptance condition; record the evidence and the user decision or workflow rule permitting it. Availability alone does not make a weaker check equivalent.
- `Deferred`: a necessary external condition is unavailable; record the remaining check, follow-up owner or unresolved owner, and the condition for resuming it. This remains unaccepted work.
- `Incomplete`: implementation, integration, or verification is missing, failed, or stale.

Report full completion only when all committed items are `Verified` or `Accepted equivalent evidence`, all required workflow gates are satisfied, and no unresolved defect violates an acceptance condition. Any `Deferred` or `Incomplete` item prevents full completion. Record explicitly authorized scope changes separately; do not count removed work as verified or describe the original scope as complete. Never weaken a criterion just to close the task.

Report the delivered outcome, artifact and evidence locations, remaining limitations, and any material cost or scheduling deviation concisely. Link the detailed acceptance record when one exists. Retain the same ownership, verification, and final-accountability standards whether execution was serial or delegated.
