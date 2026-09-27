"""官方驗證報告必須綁定相同模型，不能用檔名或成功旗標取代。"""

from copy import deepcopy

import pytest

from tools.catalog.glb import verify_validator_report
from tools.catalog.policies import CatalogError


def valid_report():
    return {'modelSha256': 'a' * 64, 'modelByteLength': 100,
            'validatorVersion': '2.0.0-dev.3.10', 'mimeType': 'model/gltf-binary',
            'issues': {'numErrors': 0, 'numWarnings': 0, 'truncated': False, 'messages': []}}


def test_validator_report_accepts_matching_complete_clean_model():
    verify_validator_report(valid_report(), {'sha256': 'a' * 64, 'bytes': 100})


@pytest.mark.parametrize('field,value', [('modelSha256', 'b' * 64), ('modelByteLength', 99),
    ('modelByteLength', True), ('validatorVersion', ''), ('mimeType', 'application/json')])
def test_validator_report_rejects_wrong_model_or_generator(field, value):
    report = valid_report()
    report[field] = value
    with pytest.raises(CatalogError):
        verify_validator_report(report, {'sha256': 'a' * 64, 'bytes': 100})


@pytest.mark.parametrize('field,value', [('numErrors', 1), ('numErrors', False),
    ('numWarnings', 1), ('numWarnings', -1), ('truncated', True), ('messages', [{'severity': 1}])])
def test_validator_report_does_not_ignore_errors_warnings_or_truncation(field, value):
    report = deepcopy(valid_report())
    report['issues'][field] = value
    with pytest.raises(CatalogError):
        verify_validator_report(report, {'sha256': 'a' * 64, 'bytes': 100})
