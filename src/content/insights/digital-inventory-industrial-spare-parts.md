---
title: 'Which Industrial Spare Parts Belong in a Digital Inventory?'
description: 'How repair economics, production readiness, and delivery time determine which industrial spares to make on demand and which to keep in stock.'
publishDate: 2026-09-05
category: 'Supply Chain Analysis'
tags:
  - additive manufacturing
  - spare parts
  - digital inventory
  - industrialization
  - procurement
author: 'Como Precision'
featured: true
draft: false
researchBased: true
externalResearch:
  disclosure: 'This article is an original Como Precision analysis based on public online information from the sources listed below. Company case studies and estimates are attributed to their issuers. The inventory decision framework is our analysis, not a certification standard. Earlier examples are dated where the source provides a publication date.'
  sources:
    - title: 'Quickparts Deepens Its Space and Defense Investment to Nearly $6 Million'
      publisher: 'Quickparts'
      url: 'https://quickparts.com/quickparts-deepens-its-space-and-defense-investment-to-nearly-6-million/'
      accessedDate: 2026-09-05
    - title: 'AM North selects amsight to strengthen quality evidence for certified AM production'
      publisher: 'amsight'
      url: 'https://www.amsight.de/news/am-north-selects-amsight-to-strengthen-quality-evidence-for-certified-am-production'
      accessedDate: 2026-09-05
    - title: 'Lufthansa Technik’s Unsourceable Latch: Enabling Repairs with a 3D-Printed Titanium Replacement'
      publisher: 'Materialise'
      url: 'https://www.materialise.com/en/inspiration/cases/lufthansa-technik-3d-printed-titanium-latch'
      accessedDate: 2026-09-05
    - title: 'DNV-RP-B205 Digital inventories and on-demand manufacturing'
      publisher: 'DNV'
      url: 'https://www.dnv.com/energy/standards-guidelines/dnv-rp-b205-digital-inventories-and-on-demand-manufacturing/'
      accessedDate: 2026-09-05
    - title: 'New DNV recommended practice aims to revolutionize digital parts management in the energy sector'
      publisher: 'DNV'
      url: 'https://www.dnv.com/news/2025/new-dnv-recommended-practice-aims-to-revolutionize-digital-parts-management-in-the-energy-sector/'
      accessedDate: 2026-09-05
    - title: 'Pelagus: reclaiming the aftermarket for OEMs'
      publisher: 'Wilhelmsen'
      url: 'https://www.wilhelmsen.com/media-news-and-events/news/2026/pelagus-reclaiming-the-aftermarket-for-oems/'
      accessedDate: 2026-09-05
    - title: '10 Jahre 3D-Druck bei der DB: Immer mehr Ersatzteile und Spezialwerkzeuge per Mausklick verfügbar'
      publisher: 'Deutsche Bahn'
      url: 'https://www.deutschebahn.com/de/presse/pressestart_zentrales_uebersicht/10-Jahre-3D-Druck-bei-der-DB-Immer-mehr-Ersatzteile-und-Spezialwerkzeuge-per-Mausklick-verfuegbar-13638280'
      accessedDate: 2026-09-05
---

An industrial spare part earns its place in inventory because an asset may need it before a supplier can deliver a replacement. Moving that part into a digital inventory changes where money and preparation are committed: less may be tied up in finished stock, while more is invested in engineering data, production readiness, and access to manufacturing capacity.

The difficult decision is which parts justify that exchange.

On September 1, 2026, [Quickparts announced plans to add 12 Stratasys NEO systems](https://quickparts.com/quickparts-deepens-its-space-and-defense-investment-to-nearly-6-million/) across facilities in the United States, France, Italy, and the United Kingdom. The company says deployment began in August and is scheduled to finish by October. These are stereolithography systems, not metal printers, and the announcement describes an investment in capacity rather than a completed rollout. Its emphasis on consistent production across locations highlights a requirement that also matters to digital spares: a usable manufacturing route must exist when an order arrives.

Read alongside recent industrial cases and established operator experience, that investment points to a practical way to evaluate digital inventory. Start with the maintenance problem, determine how much preparation can be completed in advance, and test whether the resulting delivery time fits the asset’s needs.

## Start with the repair bill

The best candidate may be a small component whose absence forces an expensive maintenance decision.

In [Materialise’s Lufthansa Technik case study](https://www.materialise.com/en/inspiration/cases/lufthansa-technik-3d-printed-titanium-latch), a damage-prone polymer latch could not be purchased separately from the original equipment manufacturer. Replacing the whole roller shutter assembly was therefore necessary when the latch failed. Lufthansa Technik developed a Ti6Al4V replacement, and Materialise describes the supplier audit and manufacturing coordination used to bring it into production. The redesigned latch allowed a targeted repair.

The case changes the relevant cost comparison. A titanium print may cost more than an injection-molded latch in a large production run, but that inexpensive loose latch was not available to the maintenance team. The available alternative was an entire assembly. Materialise reports an expected improvement in service life but provides no numerical lifetime or cost comparison, so neither should be assumed.

For a spare-part assessment, begin by recording what happens today when the item fails. Does maintenance replace a larger assembly, wait for a minimum production batch, search for obsolete stock, or remove a working part from another asset? Compare the proposed route with that actual response, including labor and disruption where these can be substantiated.

Geometry is only one reason a component may be suitable for AM. An inability to buy the right level of replacement can be a stronger commercial reason. A material substitution still requires engineering review of function, interfaces, and service conditions; reproducing the shape does not establish equivalence.

## Separate first-part development from repeat supply

A first replacement order may require data recovery, design work, manufacturing trials, inspection planning, and customer acceptance. A repeat order can reuse much of that preparation if the design and production route remain valid.

Combining those two situations into one quoted lead time makes digital inventory difficult to evaluate. The first order reveals the cost of creating the option to manufacture. Repeat orders reveal how useful that option is.

DNV makes readiness part of the subject in its [public description of DNV-RP-B205](https://www.dnv.com/energy/standards-guidelines/dnv-rp-b205-digital-inventories-and-on-demand-manufacturing/), edition February 2025. The recommended practice covers part suitability for digitization and readiness for on-demand delivery. Its [March 2025 explanation](https://www.dnv.com/news/2025/new-dnv-recommended-practice-aims-to-revolutionize-digital-parts-management-in-the-energy-sector/) describes progression from capturing data and preparing engineering documentation to qualification and production. Those public descriptions support distinguishing a recorded geometry from a part that is ready to order.

In an internal catalogue, make the unfinished work visible. A scanned part with unknown material condition should carry a different status from one with an accepted drawing, an established route, inspection criteria, and an available producer. This is a proposed management distinction, not a reproduction of DNV’s formal readiness levels.

The useful catalogue measure is the number of parts for which a buyer can obtain a dependable delivery commitment. Counting files alone rewards digitization even when most of the work remains ahead.

## Measure the complete route to an accepted part

The relevant clock starts when maintenance identifies the need and stops when an accepted replacement is available for installation.

Depending on the part, that interval can include order review, material procurement, a machine queue, printing, heat treatment, machining, finishing, inspection, document release, and transport. Some activities overlap. Others depend on shared equipment or an outside provider. A credible delivery estimate must follow the actual sequence, with allowance for rework and unavailable capacity.

Documentation can be a meaningful part of that workload. In an [August 12 announcement from amsight](https://www.amsight.de/news/am-north-selects-amsight-to-strengthen-quality-evidence-for-certified-am-production), AM North estimated that documentation effort fell from around eight hours per project to approximately 1.5–2 hours after adopting the supplier’s software. The case concerns connecting production and inspection records that had previously been assembled manually. These are customer estimates published by the software provider; they measure documentation labor, not total lead time or independently verified factory savings.

The implication for a buyer is to ask how much work will be repeated with each small order. A production route that requires several hours of manual record reconstruction every time may remain costly even after engineering has been completed. Conversely, reusable preparation may improve the economics without changing printer speed.

Physical stock remains necessary where a plausible manufacturing delay exceeds the acceptable interruption. A digital route can replenish a small buffer or support planned maintenance while the buffer covers urgent failures. “On demand” must be translated into a delivery interval before it can inform a stock decision.

## Let the part determine the manufacturing method

A digital inventory can support several production methods. Selecting AM for every item would narrow the available solutions before the maintenance problem has been understood.

In a [May 19, 2026 account from Wilhelmsen](https://www.wilhelmsen.com/media-news-and-events/news/2026/pelagus-reclaiming-the-aftermarket-for-oems/), Pelagus describes a shift toward recurring demand for legacy OEM parts. It works with original makers to prepare manufacturing definitions covering materials, production, post-processing, testing, and certification. Its network uses CNC machining, casting, and additive processes. This is the venture’s account of its operating model, rather than independent evidence of delivery performance.

That approach makes sense for a mixed spare-parts portfolio. A simple part may have a straightforward machining route. A casting may benefit from digitally produced tooling. Complex geometry or an opportunity to redesign a difficult repair may justify direct AM. Compare suitable routes using the same drawing, quantity, service requirements, and acceptance criteria.

For each route, separate the initial engineering cost from recurring production and administration. Then assess likely demand over the remaining asset life. Low annual volume can still justify preparation when the alternative is expensive or unavailable, but a large catalogue of parts that are never ordered can also absorb substantial engineering effort.

The first project should test a specific procurement problem with credible demand. Expanding the catalogue becomes easier to justify once that test shows what preparation costs and what repeat supply actually delivers.

## Check whether a second location provides a real alternative

Geographic reach can shorten transport and create sourcing options. Its value depends on the details of the route available at each location.

A buyer considering distributed supply should identify which sites can produce the particular part, what customer acceptance is required, which materials are available, and where finishing and inspection take place. Two nearby printers that both rely on the same distant heat-treatment or inspection provider may share a bottleneck. A file that can be transferred immediately does not resolve that dependency.

The Quickparts investment shows that providers are committing equipment to production across countries. It does not establish that any arbitrary part can move between sites without additional work. Site transfer, material availability, production records, customer requirements, and any applicable restrictions still need to be checked for the order concerned.

Ask a proposed backup supplier to walk through the complete route and quote a repeat order. That exercise is more informative than a list of facilities. It exposes missing process steps, lead-time assumptions, and the effort required to make the second source usable.

## Choose a stock policy for each candidate

The following framework combines maintenance urgency, repeat demand, and manufacturing readiness. It is an editorial decision aid, not a prescribed standard.

| Spare-part situation                                                                     | Practical inventory approach                                    | Evidence to obtain before changing stock                                                             |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| An unexpected failure needs a replacement sooner than manufacturing can reliably deliver | Keep a physical buffer and develop a replenishment route        | Demand and failure history, acceptable interruption, and realistic replenishment time                |
| Demand is infrequent but recurring, and the response window allows production            | Prepare a digital definition and an established on-demand route | Accepted first article, repeat-order cost, available capacity, and complete delivery time            |
| A low-value component causes replacement of a costly assembly                            | Evaluate an engineered repair or replacement component          | Functional requirements, authorized design changes, repair acceptance, and the real alternative cost |
| Supply is inexpensive and dependable, with little benefit from customization             | Continue conventional procurement                               | A credible reason why a change would improve total cost, availability, or asset support              |

The same part may change category as equipment ages, supply contracts end, or failure patterns become clearer. Review the decision when those conditions change. Digital inventory requires continued maintenance of drawings, process definitions, supplier capability, and acceptance records, just as physical inventory requires stock control.

## Build a useful portfolio before enlarging it

Long-term operator experience provides perspective on what an established programme looks like. In its [November 25, 2025 anniversary report](https://www.deutschebahn.com/de/presse/pressestart_zentrales_uebersicht/10-Jahre-3D-Druck-bei-der-DB-Immer-mehr-Ersatzteile-und-Spezialwerkzeuge-per-Mausklick-verfuegbar-13638280), Deutsche Bahn said it had produced more than 200,000 components across more than 1,000 applications since 2015. It reported over 1,000 virtual models in its digital warehouse and cumulative savings exceeding €20 million. These are DB’s historical programme figures: component volume is not the number of distinct stocked items, and the totals do not establish a return for another operator.

For a new portfolio, start with a small group of parts whose demand and sourcing difficulties are documented. Record the original supply problem, the cost of preparing the alternative, first-article results, and the performance of a repeat order. Track accepted deliveries within the maintenance window, engineering effort per added part, and the stock that can actually be reduced.

Stop expanding a particular route if approval remains unresolved, demand does not justify preparation, or the complete delivery time fails to meet the requirement. A conventional source, a physical buffer, or a different repair strategy may remain the appropriate answer.

A useful project submission therefore includes the drawing and revision, material and service conditions, expected demand, current lead time, failure consequences, replacement options, and inspection requirements. Those inputs allow engineering and procurement teams to select a manufacturing route and a stock policy together.

The spare parts that belong in a digital inventory are the ones for which advance preparation creates a dependable and economically justified supply option. That option becomes valuable when a maintenance team can order an accepted part within the time the asset can afford to wait.
