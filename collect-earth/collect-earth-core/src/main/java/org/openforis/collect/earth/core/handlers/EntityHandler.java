package org.openforis.collect.earth.core.handlers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openforis.collect.model.NodeChangeMap;
import org.openforis.collect.model.NodeChangeSet;
import org.openforis.idm.metamodel.EntityDefinition;
import org.openforis.idm.metamodel.NodeDefinition;
import org.openforis.idm.model.Entity;

/**
 * @author Alfonso Sanchez-Paus Diaz
 *
 */
public class EntityHandler extends AbstractAttributeHandler<Entity> {

	// Expected : colllect_entity_topography[house].code_coverage=XX
	private static final String PREFIX = "entity_";

	private BalloonInputFieldsUtils balloonInputFieldUtils;
	
	public EntityHandler(BalloonInputFieldsUtils balloonInputFieldUtils) {
		super(PREFIX);
		this.balloonInputFieldUtils = balloonInputFieldUtils;
	}
	
	@Override
	public NodeChangeSet addOrUpdate(String parameterName, String parameterValue, Entity parentEntity, int childParameterIndex) {
		NodeChangeMap result = new NodeChangeMap();
		
		// Expected parameter name:
		// collect_entity_topography[house].code_coverage=XX
		Entity childEntity = getChildEntity(parameterName, parentEntity);
		Map<String,String> parameters = new HashMap<String, String>();
		String childAttributeParameter = extractNestedAttributeParameterName(parameterName);
		parameters.put(childAttributeParameter, parameterValue);

		NodeChangeSet otherChangeSet = balloonInputFieldUtils.saveToEntity(parameters, childEntity);
		result.addMergeChanges(otherChangeSet);
		return result;
	}

	public Entity getChildEntity(String parameterName, Entity parentEntity) {
		String cleanName = removePrefix(parameterName);
		String childEntityName = getEntityName(cleanName);
		String keyValue = getEntityKey(cleanName);
		Entity childEntity = getChildEntity(parentEntity, childEntityName, keyValue);
		if (childEntity == null) {
			throw new IllegalStateException(String.format("Enumerated entity expected but not found: %s[%s]", childEntityName, keyValue));
		}
		return childEntity;
	}
	
	private Entity getChildEntity(Entity parentEntity, String entityName, String entityKey) {
		List<Entity> entities = parentEntity.findChildEntitiesByKeys(entityName, entityKey);
		if (entities.isEmpty()) {
			return null;
		} else {
			return entities.get(0);
		}
	}

	@Override
	public String getParameterValue(Entity value) {
		throw new UnsupportedOperationException("Cannot create a value for a Entity object");
	}

	@Override
	protected Entity createValue(String parameterValue) {
		throw new UnsupportedOperationException("Cannot create enumerated entities, they should be automatically initialized by RecordManager");
	}

	public String extractNestedAttributeParameterName(String parameterName) {
		int indexOfDot = parameterName.indexOf('.');
		return parameterName.substring(indexOfDot + 1);
	}

	private String getEntityKey(String parameterName) {
		int indexOfKeyStart = parameterName.indexOf("[");
		int indexOfKeyEnd = parameterName.indexOf("]");
		return parameterName.substring(indexOfKeyStart + 1, indexOfKeyEnd);
	}

	// topography[house].code_coverage=XX
	private String getEntityName(String parameterName) {
		int indexOfKey = parameterName.indexOf("[");
		return parameterName.substring(0, indexOfKey);
	}

	@Override
	public boolean isParseable(NodeDefinition def) {
		return def instanceof EntityDefinition;
	}

	@Override
	public boolean isMultiValueAware() {
		return true;
	}
}
