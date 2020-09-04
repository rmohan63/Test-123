import { Selector } from 'testcafe';

import { env } from 'https://integration.nswccorona.cloud/ammo/';

import { acceptTos, createHttpLogger } from '../test-utilities';

import { picpActivityManagerUser, picpClerkUser, picpMrtUser } from '../user-roles';



let newSample;

 

const createSampleLogger = createHttpLogger(`/_api/picp/Samples`, 'post');

const deleteSampleLogger = createHttpLogger(`_api/picp/samples`, 'delete');

const editSampleLogger = createHttpLogger(`_api/picp/samples`, 'patch');

const getActivitiesLogger = createHttpLogger(`_api/picp/odata/activities`, 'get');

 

fixture(`PICP - Manage Sample`)

    .page(`${env.url}/picp/samples`)

    .beforeEach(async (testController: TestController) => {});

 

test.requestHooks(createSampleLogger, getActivitiesLogger)(

    'Create Sample as MRT',

    async (testController: TestController) => {

        await createSample(testController, picpMrtUser);

    },

);

 

test.requestHooks(editSampleLogger, getActivitiesLogger)(

    'Edit Sample as MRT',

    async (testController: TestController) => {

        await editSample(testController, picpMrtUser);

    },

);

 

test.requestHooks(deleteSampleLogger, getActivitiesLogger)(

    'Delete Sample as MRT',

    async (testController: TestController) => {

        await deleteSample(testController, picpMrtUser);

    },

);

 

test.requestHooks(createSampleLogger, getActivitiesLogger)(

    'Create Sample as Activity Manager',

    async (testController: TestController) => {

        await createSample(testController, picpActivityManagerUser);

    },

);

 

test.requestHooks(editSampleLogger, getActivitiesLogger)(

    'Edit Sample as Activity Manager',

    async (testController: TestController) => {

        await editSample(testController, picpActivityManagerUser);

    },

);

 

test.requestHooks(deleteSampleLogger, getActivitiesLogger)(

    'Delete Sample as Activity Manager',

    async (testController: TestController) => {

        await deleteSample(testController, picpActivityManagerUser);

    },

);

 

test.requestHooks(createSampleLogger, getActivitiesLogger)(

    'Create Sample as Clerk',

    async (testController: TestController) => {

        await createSample(testController, picpClerkUser);

    },

);

 

test.requestHooks(editSampleLogger, getActivitiesLogger)(

    'Edit Sample as Clerk',

    async (testController: TestController) => {

        await editSample(testController, picpClerkUser);

    },

);

 

test.requestHooks(deleteSampleLogger, getActivitiesLogger)(

    'Delete Sample as Clerk',

    async (testController: TestController) => {

        await deleteSample(testController, picpClerkUser);

    },

);

 

async function createSample(testController, user) {

    await navigateToSamples(testController, user);

 

    await testController

        .click(Selector('#create-sample-button'))

        .click(Selector('select[formcontrolname="processTypeId"'))

        .click(Selector('option').withText('Automated Data Entry Process'))

 

        .selectText(Selector('input[formcontrolname="populationSize"]'))

        .pressKey('delete')

        .typeText(Selector('input[formcontrolname="populationSize"]'), '100')

 

        .selectText(Selector('input[formcontrolname="sampleSize"]'))

        .pressKey('delete')

        .typeText(Selector('input[formcontrolname="sampleSize"]'), '10')

 

        .typeText(Selector('#error-causes').find('input'), '4')

 

        // Should display validation message

        .expect(Selector('#validation-message').exists)

        .ok()

 

        .typeText(Selector('#error-types').find('input'), '4')

 

        // Validation message should be gone

        .expect(Selector('#validation-message').exists)

        .notOk()

 

        .click(Selector('button').withText('Save'))

        .expect(

            createSampleLogger.contains(request => {

                newSample = JSON.parse(request.response.body);

                return request.response.statusCode === 200;

            }),

        )

        .ok();

}

 

async function editSample(testController, user) {

    await navigateToSamples(testController, user);

 

    await testController

        .click(Selector(`tr.sample-${newSample.id}`).find('a'))

        .click(Selector('button').withText('Save'))

        .expect(

            editSampleLogger.contains(request => {

                return request.response.statusCode === 200;

            }),

        )

        .ok();

}

async function deleteSample(testController, user) {

    await navigateToSamples(testController, user);

 

    await testController

        // Hit delete button on table

        .click(Selector(`tr.sample-${newSample.id}`).find('button.delete-sample'))

        // Hit confirmation message to really delete

        .click(Selector('make-confirm-delete-dialog button').withText('Delete'))

        .expect(

            deleteSampleLogger.contains(request => {

                return request.response.statusCode === 200;

            }),

        )

        .ok();

}

 

async function navigateToSamples(testController: TestController, user: Role) {

    await testController.useRole(user);

    await acceptTos(testController);

 

    await testController

        // Wait until activities are loaded so we can click the select

        .expect(

            getActivitiesLogger.contains(request => {

                return request.response.statusCode === 200;

            }),

        )

        .ok();

 

    await testController

        .wait(1000)

        .click(Selector('#activity-filter'))

        .click(

            Selector('#activity-filter option')

                .withAttribute('value')

                // Hard coding value here because we need to ensure all of the users have access to this activity

                .withText('Camp Fuji'),

        )

        // Pause let filter action complete

        .wait(1100);

 

    // Clean logger for next test

    getActivitiesLogger.clear();

}
